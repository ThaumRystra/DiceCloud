Package.describe({
  summary: 'Patreon OAuth flow',
  version: '0.1.0'
});

Package.onUse(api => {
  api.use('ecmascript');
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', 'server');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.addFiles('patreon_server.js', 'server');
  api.addFiles('patreon_client.js', 'client');

  api.export('Patreon');
});
