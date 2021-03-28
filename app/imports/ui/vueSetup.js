import Vue from 'vue';
import store from '/imports/ui/vuexStore.js';
import VueMeteorTracker from 'vue-meteor-tracker';
import AppLayout from '/imports/ui/layouts/AppLayout.vue';
import ReactiveProvide from 'vue-reactive-provide';
import VueObserverUtils from '@tozd/vue-observer-utils';
import router from '/imports/ui/router.js';
import '/imports/ui/components/global/globalIndex.js';
import '/imports/ui/markdownCofig.js';
import vuetify from '/imports/ui/vuetify.js';
import Vuetify from 'vuetify/lib';
import { Scroll } from 'vuetify/lib/directives'

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
});
Vue.use(VueObserverUtils);

// App start
Meteor.startup(() => {
  // Start the Vue app
  new Vue({
    router,
    store,
    vuetify,
    ...AppLayout,
  }).$mount('#app');
});
