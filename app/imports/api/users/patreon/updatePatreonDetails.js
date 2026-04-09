import { fetch } from 'meteor/fetch';
if (!Meteor.isServer) throw 'Server only, do not import this code in the client';

const getConfig = async function () {
  return await ServiceConfiguration.configurations.findOneAsync({ service: 'patreon' });
};

const getIdentity = async function (accessToken) {
  const params = new URLSearchParams({
    'include': 'memberships.currently_entitled_tiers',
    'fields[tier]': 'amount_cents,title',
  });
  const response = await fetch(`https://www.patreon.com/api/oauth2/v2/identity?${params}`, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
  });
  return await response.json();
};

// Should return a new access token for the user
const refreshAccessToken = async function (refreshToken, userId) {
  const config = await getConfig();
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.secret,
  });
  const response = await fetch(`https://www.patreon.com/api/oauth2/token?${params}`, {
    method: 'POST',
  });
  const body = await response.text();
  // Should return an access token, valid for 1 month, which needs to be
  // stored and used to make requests on behalf of the user
  const token = JSON.parse(body);
  await writePatreonToken(userId, token);
  return token.access_token;
};

const updateIdentity = async function (accessToken, userId) {
  const identity = await getIdentity(accessToken);
  let entitledAmount = 0;
  if (identity && identity.included) {
    identity.included.forEach(doc => {
      if (
        doc.type === 'tier' &&
        doc.attributes &&
        doc.attributes.amount_cents > entitledAmount
      ) {
        entitledAmount = doc.attributes.amount_cents;
      }
    });
  }
  await writeEntitledCents(userId, entitledAmount);
};

const updatePatreonDetails = async function (user) {
  if (!user) {
    throw new Meteor.Error('no-user', 'User must be provided to update patreon details');
  }
  if (!user.services.patreon || !user.services.patreon.accessToken) {
    throw new Meteor.Error('no-patreon-access', 'Patreon access token not found for this user');
  }
  let accessToken = user.services.patreon.accessToken;
  if (user.services.patreon.expiresAt < new Date()) {
    // Token expired, refresh it before continuing
    accessToken = await refreshAccessToken(user.services.patreon.refreshToken, user._id);
  }
  await updateIdentity(accessToken, user._id);
}

Meteor.methods({
  async updateMyPatreonDetails() {
    const userId = this.userId;
    if (!userId) throw new Meteor.Error('not-logged-in', 'You must be logged in to update Patreon details');
    const user = await Meteor.users.findOneAsync(userId, { fields: { services: 1 } });
    await updatePatreonDetails(user);
  },
});

const writePatreonToken = async function (userId, {
  access_token, refresh_token, expires_in
}) {
  // The expiry date is now plus `expires_in` seconds
  let expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);
  // Expire a day early so we don't accidentally miss it
  expiryDate.setDate(expiryDate.getDate() - 1);

  // Write
  await Meteor.users.updateAsync(userId, {
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

const writeEntitledCents = async function (userId, amount) {
  await Meteor.users.updateAsync(userId, {
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
