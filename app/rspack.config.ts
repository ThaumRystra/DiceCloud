import { defineConfig } from '@meteorjs/rspack';
import { VueLoaderPlugin } from 'vue-loader';

export default defineConfig(Meteor => ({
  devtool: 'source-map',
  ...Meteor.isClient && {
    plugins: [new VueLoaderPlugin()],
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
