Package.describe({
  summary: 'Login service for Patreon accounts',
  version: '0.1.0',
});

Package.onUse(api => {
  api.use('ecmascript');
  api.use('accounts-base', ['client', 'server']);
  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);

  api.use('accounts-oauth', ['client', 'server']);
  api.use('patreon-oauth');
  api.imply('patreon-oauth');

  api.addFiles('patreon.js');
});
