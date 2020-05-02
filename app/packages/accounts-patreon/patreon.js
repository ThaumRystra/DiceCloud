Accounts.oauth.registerService('patreon');

if (Meteor.isClient) {
  const loginWithPatreon = (options, callback) => {
    // support a callback without options
    if (! callback && typeof options === 'function') {
      callback = options;
      options = null;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Patreon.requestCredential(options, credentialRequestCompleteCallback);
  };
  Accounts.registerClientLoginFunction('patreon', loginWithPatreon);
  Meteor.loginWithPatreon =
    (...args) => Accounts.applyLoginFunction('patreon', args);
} else {
  Accounts.addAutopublishFields({
    // publish all fields including access token, which can legitimately
    // be used from the client (if transmitted over ssl or on
    // localhost). http://www.meetup.com/meetup_api/auth/#oauth2implicit
    forLoggedInUser: ['services.patreon'],
    forOtherUsers: ['services.patreon.id']
  });
}
