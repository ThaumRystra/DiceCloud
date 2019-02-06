import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";
import store from "/imports/ui/vuexStore.js";
import VueMeteorTracker from 'vue-meteor-tracker';
import AppLayout from '/imports/ui/layouts/AppLayout.vue';
import router from "/imports/ui/router.js";
import "vuetify/dist/vuetify.min.css";
import theme from '/imports/ui/theme.js';

Vue.use(VueMeteorTracker);
Vue.use(Vuetify, {
  theme,
  iconfont: "md",
});


// App start
Meteor.startup(() => {
  // Start the Vue app
  new Vue({
    router,
    store,
    ...AppLayout,
  }).$mount("#app");
});
