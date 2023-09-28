import Vue from 'vue';
import store from '/imports/client/ui/vuexStore';
import VueMeteorTracker from 'vue-meteor-tracker';
import AppLayout from '/imports/client/ui/layouts/AppLayout.vue';
import ReactiveProvide from 'vue-reactive-provide';
import VueObserverUtils from '@tozd/vue-observer-utils';
import router from '/imports/client/ui/router';
import '/imports/client/ui/components/global/globalIndex';
import '/imports/client/ui/markdownCofig';
import vuetify from '/imports/client/ui/vuetify';

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
