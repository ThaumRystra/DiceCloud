import { h } from 'vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import { aliases as mdiAliases, mdi } from 'vuetify/lib/iconsets/mdi.js';
import SVG_ICONS from '/imports/constants/SVG_ICONS';
import SvgIconByName from '/imports/client/ui/icons/SvgIconByName.vue';
import themes from '/imports/client/ui/themes';

// Build aliases mapping from icon display name → custom icon set key
const customAliases = {};
for (const key in SVG_ICONS) {
  const icon = SVG_ICONS[key];
  customAliases[icon.name] = `custom:${key}`;
}

// Custom icon set that renders SvgIconByName with the SVG_ICONS key
const customSvgSet = {
  component: (props) => h(SvgIconByName, { name: props.icon }),
};

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        colors: themes.light,
      },
      dark: {
        colors: themes.dark,
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases: { ...mdiAliases, ...customAliases },
    sets: { mdi, custom: customSvgSet },
  },
});

export default vuetify;
