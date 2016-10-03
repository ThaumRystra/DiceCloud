Package.describe({
  name: 'thaum:vulcanize',
  summary: 'Vulcanize',
  version: '2.2.0',
  git: 'https://github.com/Differential/meteor-vulcanize'
});

Package.registerBuildPlugin({
  name: 'vulcanize',
  use: [
    "underscore@1.0.3"
  ],
  sources: [
    'vulcanize.js'
  ],
  npmDependencies: {'vulcanize': '1.14.7'}
});

Package.onUse(function (api) {
  api.use('underscore');
  api.use('isobuild:compiler-plugin@1.0.0');
});
