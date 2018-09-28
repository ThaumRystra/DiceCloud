import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2';
import Vue from "vue";

// Components
import Home from '/imports/ui/pages/Home.vue';
import CharacterList from "/imports/ui/pages/CharacterList.vue"

// Not found
import NotFound from '/imports/ui/pages/NotFound.vue';


// Create router instance
const routerFactory = new RouterFactory({
  mode: 'history',
  scrollBehavior: nativeScrollBehavior,
});


RouterFactory.configure(factory => {
  // Simple routes
  factory.addRoutes([
    {
      path: '/',
      name: 'home',
      component: Home,
    },{
      path: "/characterList",
      component: CharacterList,
    }
  ]);
});

// Not found route has lowest priority
RouterFactory.configure(factory => {
  factory.addRoute({
    path: '*',
    component: NotFound,
  });
}, -1);

export default routerFactory;
