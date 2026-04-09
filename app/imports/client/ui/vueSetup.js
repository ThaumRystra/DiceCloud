import { createApp } from 'vue';
import store from '/imports/client/ui/vuexStore';
import { VueMeteor as VueMeteorTracker } from 'vue-meteor-tracker';
import AppLayout from '/imports/client/ui/layouts/AppLayout.vue';
import router from '/imports/client/ui/router';
import { registerGlobalComponents } from '/imports/client/ui/components/global/globalIndex';
import '/imports/client/ui/markdownCofig';
import vuetify from '/imports/client/ui/vuetify';

import '/imports/api/simpleSchemaConfig';
import '/imports/client/ui/styles/stylesIndex';
import '/imports/client/config';
import '/imports/client/serviceWorker';

// App start
Meteor.startup(() => {
  const app = createApp(AppLayout);
  app.use(VueMeteorTracker);
  app.use(router);
  app.use(store);
  app.use(vuetify);
  registerGlobalComponents(app);
  app.mount('#app');
});
