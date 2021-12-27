import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import { Scroll } from 'vuetify/lib/directives';
import SVG_ICONS from '/imports/constants/SVG_ICONS.js';
import SvgIconByName from '/imports/ui/icons/SvgIconByName.vue';
import themes from '/imports/ui/themes.js';
import minifyTheme from 'minify-css-string';

Vue.use(Vuetify, {
  directives: {
    Scroll,
  },
});

let icons = {};

for (const name in SVG_ICONS) {
  let icon = SVG_ICONS[name];
  icons[icon.name] = {
    component: SvgIconByName,
    props: {
      name: name,
    }
  }
}

let vuetify = new Vuetify({
  theme: {
    themes,
    options: {
      variations: false,
      minifyTheme,
    },
    //options: { customProperties: true },
  },
  icons: {
    iconfont: 'mdi',
    values: icons,
  }
});

export default vuetify;
