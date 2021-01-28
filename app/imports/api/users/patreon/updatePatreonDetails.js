import request from 'request';
if (!Meteor.isServer) throw 'Server only, do not import this code in the client';

const config = ServiceConfiguration.configurations.findOne({service: 'patreon'});
const getIdentity = function(accessToken, callback){
  request({
    uri: 'https://www.patreon.com/api/oauth2/v2/identity',
    headers:{
      Authorization: 'Bearer ' + accessToken,
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
    method: 'POST',
    uri: 'https://www.patreon.com/api/oauth2/token',
    qs: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.secret,
    }
  }, Meteor.bindEnvironment((error, response, body) => {
    // Should return an access token, valid for 1 month, which needs to be
    // stored and used to make requests on behalf of the user
    if (error){
      if (callback){
        callback(error);
        return;
      } else {
        throw error;
      }
    }
    let token;
    try {
      token = JSON.parse(body);
      writePatreonToken(userId, token);
      callback(undefined, token.access_token);
    } catch(error) {
      if (callback){
        callback(error);
        return;
      } else {
        throw error;
      }
    }
  }));
});

const updateIdentity = Meteor.wrapAsync(function(accessToken, userId, callback){
  getIdentity(accessToken, Meteor.bindEnvironment((error, response, body) => {
    if (error){
      throw error;
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
      writeEntitledCents(userId, entitledAmount);
      if (callback) callback();
    } catch(error) {
      if(callback) {
        callback(error);
      } else {
        throw error;
      }
    }
  }));
});

const updatePatreonDetails = function(user){
  if (!user) {
    throw new Meteor.Error('no-user', 'User must be provided to update patreon details');
  }
  if (!user.services.patreon || !user.services.patreon.accessToken){
    throw new Meteor.Error('no-patreon-access', 'Patreon access token not found for this user');
  }
  let accessToken = user.services.patreon.accessToken;
  if (user.services.patreon.expiresAt < new Date()){
    // Token expired, refresh it before continuing
    accessToken = refreshAccessToken(user.services.patreon.refreshToken, user._id);
  }
  updateIdentity(accessToken, user._id);
}

Meteor.methods({
  updateMyPatreonDetails(){
    const userId = this.userId;
    if (!userId) throw new Meteor.Error('not-logged-in', 'You must be logged in to update Patreon details');
    const user = Meteor.users.findOne(userId, {fields: {services: 1}});
    updatePatreonDetails(user);
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
      'services.patreon.accessToken': access_token,
      'services.patreon.refreshToken': refresh_token,
      'services.patreon.expiresAt': expiryDate,
    },
    $unset: {
      'patreon.error': 1,
    },
  });
};

const writeEntitledCents = function(userId, amount){
  Meteor.users.update(userId, {
    $set: {
      'services.patreon.entitledCents': amount,
      'services.patreon.lastUpdatedIdentity': new Date(),
    },
    $unset: {
      'patreon.error': 1,
    },
  });
};

export default updatePatreonDetails;
