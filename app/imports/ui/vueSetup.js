import Vue from 'vue';
import store from '/imports/ui/vuexStore.js';
import VueMeteorTracker from 'vue-meteor-tracker';
import AppLayout from '/imports/ui/layouts/AppLayout.vue';
import ReactiveProvide from 'vue-reactive-provide';
import router from '/imports/ui/router.js';
import themes from '/imports/ui/themes.js';
import '/imports/ui/components/global/globalIndex.js';
import SvgIconByName from '/imports/ui/icons/SvgIconByName.vue';
import SVG_ICONS from '/imports/constants/SVG_ICONS.js';
import '/imports/ui/markdownCofig.js';

import Vuetify from 'vuetify/lib';
import { Scroll } from 'vuetify/lib/directives'

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

Vue.use(VueMeteorTracker);
Vue.config.meteor.freeze = true;
Vue.config.devtools = true;
Vue.use(Vuetify, {
  directives: {
    Scroll,
  },
});
Vue.use(ReactiveProvide, {
  name: 'reactiveProvide', // default value
})

// App start
Meteor.startup(() => {
  // Start the Vue app
  new Vue({
    router,
    store,
    vuetify: new Vuetify({
      theme: {
        dark: false,
        themes,
        options: { customProperties: true },
      },
      icons: {
        iconfont: 'md',
        values: icons,
      }
    }),
    ...AppLayout,
  }).$mount('#app');
});
