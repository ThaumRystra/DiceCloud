import { Meteor } from 'meteor/meteor'
import { createApp } from 'vue'
// import { router } from './router'
// import { VueMeteor } from './v-meteor'
import AppLayout from '/imports/client/ui/layouts/AppLayout.vue'
import VueMeteorTracker from 'vue-meteor-tracker';

Meteor.startup(() => {
  const app = createApp(AppLayout)
  // app.use(router)
  app.use(VueMeteorTracker)
  app.mount('#app')
})