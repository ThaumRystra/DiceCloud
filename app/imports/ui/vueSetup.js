import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";
import routerFactory from "/imports/ui/route.js";
import store from "/imports/ui/vuexStore.js";
import VueMeteorTracker from 'vue-meteor-tracker';
import AppLayout from '/imports/ui/layouts/AppLayout.vue';
import "vuetify/dist/vuetify.min.css";

Vue.use(VueMeteorTracker);
Vue.use(Vuetify, {
  theme: {
    primary: "#424242",
    secondary: "#E53935",
    accent: "#B71C1C",
    error: "#f44336",
    warning: "#FFB300",
    info: "#5C6BC0",
    success: "#43A047",
  },
  iconfont: "mdi",
});

// Create the router instance
const router = routerFactory.create();
export router;

// App start
Meteor.startup(() => {
  // Start the Vue app
  new Vue({
    router,
    store,
    ...AppLayout,
  }).$mount("#app");
});
