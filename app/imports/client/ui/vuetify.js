import Vue from 'vue';
//import Vuetify from 'vuetify/lib';
import Vuetify from 'vuetify/lib/framework';
import { Scroll, Ripple, ClickOutside } from 'vuetify/lib/directives';
import SVG_ICONS from '/imports/constants/SVG_ICONS';
import SvgIconByName from '/imports/client/ui/icons/SvgIconByName.vue';
import themes from '/imports/client/ui/themes';
import minifyTheme from 'minify-css-string';

Vue.use(Vuetify, {
  directives: {
    Scroll,
    Ripple,
    ClickOutside,
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
