Patreon = {};

// Request Patreon credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Patreon.requestCredential = (options, credentialRequestCompleteCallback) => {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  const config = ServiceConfiguration.configurations.findOne({service: 'patreon'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError());
    return;
  }

  // For some reason, meetup converts underscores to spaces in the state
  // parameter when redirecting back to the client, so we use
  // `Random.id()` here (alphanumerics) instead of `Random.secret()`
  // (base 64 characters).
  const credentialToken = Random.id();

  const scope = (options && options.requestPermissions) || [
    'identity',
    'identity[email]',
  ];
  const flatScope = scope.map(encodeURIComponent).join(' ');
  //const flatScope = encodeURIComponent(scope.join(','));

  const loginStyle = OAuth._loginStyle('patreon', config, options);

  const loginUrl =
        'https://www.patreon.com/oauth2/authorize' +
        `?client_id=${config.clientId}` +
        '&response_type=code' +
        (flatScope ? `&scope=${flatScope}` : '') +
        `&redirect_uri=${OAuth._redirectUri('patreon', config)}` +
        `&state=${OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl)}`;

  OAuth.launchLogin({
    loginService: 'patreon',
    loginStyle,
    loginUrl,
    credentialRequestCompleteCallback,
    credentialToken,
  });
};
