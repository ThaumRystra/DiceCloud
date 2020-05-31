import Vue from 'vue';
import Vuetify from 'vuetify';
import store from '/imports/ui/vuexStore.js';
import VueMeteorTracker from 'vue-meteor-tracker';
import AppLayout from '/imports/ui/layouts/AppLayout.vue';
import ReactiveProvide from 'vue-reactive-provide';
import router from '/imports/ui/router.js';
import { theme } from '/imports/ui/theme.js';
import 'vuetify/dist/vuetify.min.css';
import '/imports/ui/components/global/globalIndex.js';
import SvgIconByName from '/imports/ui/icons/SvgIconByName.vue';
import SVG_ICONS from '/imports/constants/SVG_ICONS.js';

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
Vue.config.meteor.freeze = true
Vue.use(Vuetify, {
  theme,
  iconfont: 'md',
  icons,
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
    ...AppLayout,
  }).$mount('#app');
});
