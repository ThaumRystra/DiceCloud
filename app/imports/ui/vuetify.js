import Vuetify from 'vuetify/lib';
import SVG_ICONS from '/imports/constants/SVG_ICONS.js';
import SvgIconByName from '/imports/ui/icons/SvgIconByName.vue';
import themes from '/imports/ui/themes.js';

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
    options: { variations: false },
    //options: { customProperties: true },
  },
  icons: {
    iconfont: 'md',
    values: icons,
  }
});

export default vuetify;
