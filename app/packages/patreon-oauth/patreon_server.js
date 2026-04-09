Patreon = {};

OAuth.registerService('patreon', 2, null, async (query) => {
  const response = await getAccessToken(query);
  const accessToken = response.access_token;
  const refreshToken = response.refresh_token;
  const scope = response.scope;
  const expiresAt = (+new Date) + (1000 * response.expires_in);
  const identity = await getIdentity(accessToken);
  let serviceData = {
    id: identity.data.id,
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

const getAccessToken = async (query) => {
  const config = ServiceConfiguration.configurations.findOne({ service: 'patreon' });
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  let response;
  try {
    const params = new URLSearchParams({
      code: query.code,
      client_id: config.clientId,
      client_secret: config.secret,
      grant_type: 'authorization_code',
      redirect_uri: OAuth._redirectUri('patreon', config),
    });
    response = await fetch('https://www.patreon.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
  } catch (err) {
    throw Object.assign(
      new Error(`Failed to complete OAuth handshake with Patreon. ${err.message}`),
      { response: err.response }
    );
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Failed to complete OAuth handshake with Patreon. ${data.error}`);
  }
  return data;
};

const getIdentity = async (accessToken) => {
  try {
    const response = await fetch(
      'https://www.patreon.com/api/oauth2/v2/identity?' +
      'fields%5Buser%5D=email&' +
      'fields%5Bmember%5D=currently_entitled_amount_cents&' +
      'include=memberships',
      {
        headers: { authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await response.json();
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
