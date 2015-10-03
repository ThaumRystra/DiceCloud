Package.describe({
  summary: 'Accounts Templates for polymer',
  version: '1.12.3',
  name: 'useraccounts:polymer',
  git: 'https://github.com/meteor-useraccounts/polymer.git',
});

Package.on_use(function(api, where) {
  api.versionsFrom('METEOR@1.0');

  api.use([
    'templating',
    'underscore',
  ], 'client');

  api.use([
    'useraccounts:core',
  ], ['client', 'server']);
  
  // Requires all routing packages loads before this asking for weak dependencies.
  api.use('useraccounts:flow-routing@1.12.1', ['client', 'server'], {weak: true});
  api.use('useraccounts:iron-routing@1.12.1', ['client', 'server'], {weak: true});

  api.imply([
    'useraccounts:core@1.12.3',
  ], ['client', 'server']);

  api.add_files([
    'lib/at_error.html',
    'lib/at_error.js',
    'lib/at_form.html',
    'lib/at_form.js',
    'lib/at_input.html',
    'lib/at_input.js',
    'lib/at_message.html',
    'lib/at_message.js',
    'lib/at_nav_button.html',
    'lib/at_nav_button.js',
    'lib/at_oauth.html',
    'lib/at_oauth.js',
    'lib/at_pwd_form.html',
    'lib/at_pwd_form.js',
    'lib/at_pwd_form_btn.html',
    'lib/at_pwd_form_btn.js',
    'lib/at_pwd_link.html',
    'lib/at_pwd_link.js',
    'lib/at_reCaptcha.html',
    'lib/at_reCaptcha.js',
    'lib/at_result.html',
    'lib/at_result.js',
    'lib/at_sep.html',
    'lib/at_sep.js',
    'lib/at_signin_link.html',
    'lib/at_signin_link.js',
    'lib/at_signup_link.html',
    'lib/at_signup_link.js',
    'lib/at_social.html',
    'lib/at_social.js',
    'lib/at_terms_link.html',
    'lib/at_terms_link.js',
    'lib/at_resend_verification_email_link.html',
    'lib/at_resend_verification_email_link.js',
    'lib/at_title.html',
    'lib/at_title.js',
    'lib/full_page_at_form.html',
    'lib/at_polymer.css'
  ], ['client']);
});

Package.on_test(function(api) {
  api.use([
    'useraccounts:polymer',
    'useraccounts:core@1.12.3',
  ]);

  api.use([
    'accounts-password',
    'less',
    'tinytest',
    'test-helpers'
  ], ['client', 'server']);

  api.add_files([
    'tests/tests.js'
  ], ['client', 'server']);
});
