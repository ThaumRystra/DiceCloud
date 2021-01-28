import request from 'request';

if (
  Meteor.settings &&
  Meteor.settings.public &&
  Meteor.settings.public.patreon
) {
  const CLIENT_ID = Meteor.settings.public.patreon.clientId;
  const CLIENT_SECRET = Meteor.settings.patreon.clientSecret;
  const CREATOR_ACCESS_TOKEN = Meteor.settings.patreon.creatorAccessToken;
  const CAMPAIGN_ID = Meteor.settings.public.patreon.campaignId;

  // Handle redirects from patreon
  Router.map(function () {
    this.route("patreon-redirect", {
      path: "/patreon-redirect",
      where: "server",
      action: function () {
        let route = this;
        let userId = route.params.query.state;
        let singleUseCode = route.params.query.code;
        requestToken(singleUseCode, Meteor.bindEnvironment((error, response, body) => {
          // Should return an access token, valid for 1 month, which needs to be
          // stored and used to make requests on behalf of the user
          if (error){
            writePatreonError(userId, error);
            return;
          }
          let token;
          try {
            token = JSON.parse(body);
            writePatreonToken(userId, token);
          } catch(error) {
            writePatreonError(userId, error);
            return;
          }
          updateIdentity(token.access_token, userId);
        }));
        route.response.writeHead(302, {
          'Location': Meteor.absoluteUrl() + "account",
        });
        route.response.end();
      },
    });
  });

  const requestToken = function(singleUseCode, callback){
    request({
      method: "POST",
      uri: "https://www.patreon.com/api/oauth2/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      qs: {
        code: singleUseCode,
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: Meteor.absoluteUrl() + 'patreon-redirect',
      },
    }, callback);
  }

  const getIdentity = function(accessToken, callback){
    request({
      uri: "https://www.patreon.com/api/oauth2/v2/identity",
      headers:{
        Authorization: "Bearer " + accessToken,
      },
      qs: {
        'include': 'memberships.currently_entitled_tiers',
        'fields[tier]': 'amount_cents,title',
      }
    }, callback);
  };

  // Should return a new access token for the user
  // callback is called with (error, response, body)
  const refreshAccessToken = Meteor.wrapAsync(function(refreshToken, userId, callback){
    request({
      method: "POST",
      uri: "https://www.patreon.com/api/oauth2/token",
      qs: {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }
    }, Meteor.bindEnvironment((error, response, body) => {
      // Should return an access token, valid for 1 month, which needs to be
      // stored and used to make requests on behalf of the user
      if (error){
        callback(error)
        return;
      }
      let token;
      try {
        token = JSON.parse(body);
        writePatreonToken(userId, token);
        callback(undefined, token.access_token);
      } catch(error) {
        callback(error);
      }
    }));
  });

  const updateIdentity = Meteor.wrapAsync(function(accessToken, userId, callback){
    getIdentity(accessToken, Meteor.bindEnvironment((error, response, body) => {
      if (error){
        writePatreonError(userId, error);
        return;
      }
      try {
        let identity = JSON.parse(body);
        let entitledAmount = 0;
        if (identity && identity.included){
          identity.included.forEach(doc => {
            if (
              doc.type === 'tier' &&
              doc.attributes &&
              doc.attributes.amount_cents > entitledAmount
            ){
              entitledAmount = doc.attributes.amount_cents;
            }
          });
        }
        let patreonUserId = identity.data.id;
        writeEntitledCentsAndId(userId, entitledAmount, patreonUserId);
        if (callback) callback();
      } catch(error) {
        writePatreonError(userId, error);
        if(callback) callback(error);
      }
    }));
  });

  Meteor.methods({
    updateMyPatreonDetails(){
      const userId = this.userId;
      if (!userId) throw new Meteor.Error("not-logged-in", "You must be logged in to update Patreon details");
      const user = Meteor.users.findOne(userId, {fields: {patreon: 1}});
      Meteor.users.update(userId, {$unset: {"patreon.entitledCents": 1}});
      if (!user.patreon || !user.patreon.accessToken){
        throw new Meteor.Error("no-patreon-access", "Patreon access token not found for this user");
      }
      let accessToken = user.patreon.accessToken;
      if (user.patreon.tokenExpiryDate < new Date()){
        // Token expired, refresh it before continuing
        accessToken = refreshAccessToken(user.patreon.refreshToken, userId);
      }
      updateIdentity(accessToken, userId);
    },
  });

  const writePatreonToken = function(userId, {
    access_token, refresh_token, expires_in
  }){
    // The expiry date is now plus `expires_in` seconds
    let expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);
    // Expire a day early so we don't accidentally miss it
    expiryDate.setDate(expiryDate.getDate() - 1);

    // Write
    Meteor.users.update(userId, {
      $set: {
        "patreon.accessToken": access_token,
        "patreon.refreshToken": refresh_token,
        "patreon.tokenExpiryDate": expiryDate,
      },
      $unset: {
        "patreon.error": 1,
      },
    });
  };

  const writeEntitledCentsAndId = function(userId, amount, patreonUserId){
    Meteor.users.update(userId, {
      $set: {
        "patreon.entitledCents": amount,
        "patreon.userId": patreonUserId,
      },
      $unset: {
        "patreon.error": 1,
      },
    });
  };

  const writePatreonError = function(userId, error){
    console.error({patreonError: error});
    Meteor.users.update(userId, {
      $set: {
        "patreon.error": error.toString(),
      },
    });
  }


  const requestMembers = Meteor.wrapAsync(function(cursor, members, callback){
    request({
      uri: `https://www.patreon.com/api/oauth2/v2/campaigns/${CAMPAIGN_ID}/members`,
      headers:{
        Authorization: "Bearer " + CREATOR_ACCESS_TOKEN,
      },
      qs: {
        "include": "user",
        "fields[member]": "currently_entitled_amount_cents",
        "page[cursor]": cursor,
      }
    }, (error, reponse, body) => {
      if (error){
        callback(error);
        return;
      }
      let json = JSON.parse(body);
      if (json.errors) {
        callback(json.errors);
        return;
      }
      let newMembers = json.data.map(member => ({
        id: member.relationships.user.data.id,
        entitledCents: member.attributes.currently_entitled_amount_cents,
      }));
      members.push(...newMembers);
      let next = json.meta.pagination.cursors && json.meta.pagination.cursors.next;
      if (next){
        callback(undefined, next);
      } else {
        callback(undefined);
      }
    });
  });

  const updatePatreonMembersEntitledCents = function(){
    let next = "";
    let members = [];
    do {
      next = requestMembers(next, members);
    } while (next)
    members.forEach(({id, entitledCents}) => {
      Meteor.users.update({
        "patreon.userId": id
      }, {$set: {
        "patreon.entitledCents":entitledCents,
      }});
    });
    return members;
  }

  // Method to run a manual update
  Meteor.methods({
    updatePatreonMembersEntitledCents(){
      const user = Meteor.users.findOne(this.userId);
      if (!user || !_.contains(user.roles, "admin")) throw new Meteor.Error(
        "permission-error", "You need to be logged in as an admin to run this method"
      );
      return updatePatreonMembersEntitledCents();
    },
  });

  // Cron job to run the update automatically
  Meteor.startup(() => {
    SyncedCron.add({
  		name: "updatePatreonMembersEntitledCents",
  		schedule: function(parser) {
  			return parser.text('every 4 hours');
  		},
  		job: updatePatreonMembersEntitledCents,
  	});
  })
}
