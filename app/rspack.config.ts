import { defineConfig } from '@meteorjs/rspack';
import { VueLoaderPlugin } from 'vue-loader';
import { rspack } from '@rspack/core';

const circularPlugin = new rspack.CircularDependencyRspackPlugin({
  failOnError: false,
  exclude: /node_modules/,
});

export default defineConfig(Meteor => ({
  devtool: 'source-map',
  resolve: {
    extensions: ['...', 'ts'],
  },
  plugins: [
    circularPlugin,
  ],
  ...Meteor.isClient && {
    plugins: [new VueLoaderPlugin(), circularPlugin],
    module: {
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
    }
  },
}));
