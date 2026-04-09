const { defineConfig } = require('@meteorjs/rspack');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = defineConfig(Meteor => {
  const config = {
    devtool: 'source-map',
  };

  if (Meteor.isServer) {
    config.externals = [
      /^zlib-sync/,
      /^bufferutil$/,
      /^utf-8-validate$/,
    ];
  }

  if (Meteor.isClient) {
    config.plugins = [new VueLoaderPlugin()];
    config.module = {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            experimentalInlineMatchResource: true,
          },
        },
        {
          test: /\.css$/,
          type: 'css',
        },
        {
          test: /\.s[ac]ss$/,
          use: ['sass-loader'],
          type: 'css',
        },
      ],
    };
  }

  return config;
});
