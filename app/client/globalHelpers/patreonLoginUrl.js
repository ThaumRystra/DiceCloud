const CLIENT_ID = Meteor.settings &&
	Meteor.settings.public.patreon  &&
	Meteor.settings.public.patreon.clientId;

Template.registerHelper("patreonLoginUrl", function() {
  if (!CLIENT_ID) return;
  return formatUrl({
    protocol: 'https',
    host: 'patreon.com',
    pathname: '/oauth2/authorize',
    query: {
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: Meteor.absoluteUrl() + 'patreon-redirect',
      state: Meteor.userId(),
      scope: 'identity',
    },
  });
});
