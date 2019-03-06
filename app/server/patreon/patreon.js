import request from 'request';

const CLIENT_ID = "zv38izfGZDf8s_Z9BI5kICjGGnvs45PawHYu6cqsTqftwZ_5DZFqEGKZfdP8Q6I2";
const CLIENT_SECRET = Meteor.settings.patreon.clientSecret;

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
        getIdentity(token.access_token, Meteor.bindEnvironment((error, response, body) => {
          if (error){
            writePatreonError(userId, error);
            return;
          }
          try {
            let identity = JSON.parse(body);
            let entitledAmount = +identity.included[0].attributes
              .currently_entitled_amount_cents;
            //TODO also write the patreon userId 
            writeEntitledCents(userId, entitledAmount);
          } catch(error) {
            writePatreonError(userId, error);
          }
        }));
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

// Should return a new access token for the user
// callback is called with (error, response, body)
const refreshAccessToken = function(refreshToken, callback){
  request({
    method: "POST",
    uri: "https://www.patreon.com/api/oauth2/token",
    qs: {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }
  }, callback);
};

const getIdentity = function(accessToken, callback){
  request({
    uri: "https://www.patreon.com/api/oauth2/v2/identity",
    headers:{
      Authorization: "Bearer " + accessToken,
    },
    qs: {
      "include": "memberships",
      "fields[member]": "currently_entitled_amount_cents",
    }
  }, callback);
};

const writePatreonToken = function(userId, {access_token, refresh_token}){
  console.log('Writing token ')
  console.log({access_token, refresh_token});
  Meteor.users.update(userId, {
    $set: {
      "patreon.accessToken": access_token,
      "patreon.refreshToken": refresh_token,
    },
    $unset: {
      "patreon.error": 1,
    },
  });
  console.log(Meteor.users.findOne(userId).patreon);
};

const writeEntitledCents = function(userId, amount){
  console.log('Writing cents ')
  console.log(arguments);
  Meteor.users.update(userId, {
    $set: {
      "patreon.entitledCents": amount,
    },
    $unset: {
      "patreon.error": 1,
    },
  });
  console.log(Meteor.users.findOne(userId).patreon);
};

const writePatreonError = function(userId, error){
  console.error(error);
  Meteor.users.update(userId, {
    $set: {
      "patreon.error": error.toString(),
    },
  });
}
