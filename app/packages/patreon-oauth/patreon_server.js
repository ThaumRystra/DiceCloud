Patreon = {};

OAuth.registerService('patreon', 2, null, query => {
  const response = getAccessToken(query);
  const accessToken = response.access_token;
  const refreshToken = response.refresh_token;
  const scope = response.scope;
  const expiresAt = (+new Date) + (1000 * response.expires_in);
  const identity = getIdentity(accessToken);
  let serviceData = {
    id : identity.data.id,
    email: identity.data.attributes.email,
    entitledCents: identity.included[0] &&
      identity.included[0].attributes.currently_entitled_amount_cents || 0,
    lastUpdatedIdentity: new Date(),
    accessToken,
    refreshToken,
    scope,
    expiresAt,
  };
  return { serviceData };
});

const getAccessToken = query => {
  const config = ServiceConfiguration.configurations.findOne({service: 'patreon'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  let response;
  try {
    response = HTTP.post(
      'https://www.patreon.com/api/oauth2/token', {headers: {Accept: 'application/json'}, params: {
        code: query.code,
        client_id: config.clientId,
        client_secret: config.secret,
        grant_type: 'authorization_code',
        redirect_uri: OAuth._redirectUri('patreon', config),
      }});
  } catch (err) {
    throw Object.assign(
      new Error(`Failed to complete OAuth handshake with Patreon. ${err.message}`),
      { response: err.response }
    );
  }

  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error(`Failed to complete OAuth handshake with Patreon. ${response.data.error}`);
  } else {
    return response.data;
  }
};

const getIdentity = accessToken => {
  try {
    const response = HTTP.get(
      'https://www.patreon.com/api/oauth2/v2/identity?' +
      'fields%5Buser%5D=email&' +
      'fields%5Bmember%5D=currently_entitled_amount_cents&' +
      'include=memberships',
      {
        headers: {authorization: `Bearer ${accessToken}`},
      }
    );
    let data = JSON.parse(response.content);
    return data;
  } catch (err) {
    throw Object.assign(
      new Error(`Failed to fetch identity from Patreon. ${err.message}`),
      { response: err.response }
    );
  }
};


Patreon.retrieveCredential = (credentialToken, credentialSecret) =>
  OAuth.retrieveCredential(credentialToken, credentialSecret);
