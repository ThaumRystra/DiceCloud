import Vue from 'vue';
import store from '/imports/client/ui/vuexStore.js';
import VueMeteorTracker from 'vue-meteor-tracker';
import AppLayout from '/imports/client/ui/layouts/AppLayout.vue';
import ReactiveProvide from 'vue-reactive-provide';
import VueObserverUtils from '@tozd/vue-observer-utils';
import router from '/imports/client/ui/router.js';
import '/imports/client/ui/components/global/globalIndex.js';
import '/imports/client/ui/markdownCofig.js';
import vuetify from '/imports/client/ui/vuetify.js';

Vue.use(VueMeteorTracker);
Vue.config.meteor.freeze = true;
Vue.config.devtools = true;
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
