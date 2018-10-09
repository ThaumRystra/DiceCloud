import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2';
import Vue from "vue";

// Components
import Home from '/imports/ui/pages/Home.vue';
import CharacterList from "/imports/ui/pages/CharacterList.vue";
import SignIn from "/imports/ui/pages/SignIn.vue" ;
import Register from "/imports/ui/pages/Register.vue" ;
import Account from "/imports/ui/pages/Account.vue" ;
import TestDialog from "/imports/ui/dialogStack/TestDialog.vue"

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
    },{
			path: "/sign-in",
			component: SignIn,
		},{
			path: "/register",
			component: Register,
		},{
			path: "/account",
			component: Account,
		},{
			path: "/test-dialog",
			component: TestDialog,
		},
  ]);
});

// Not found route has lowest priority
RouterFactory.configure(factory => {
  factory.addRoute({
    path: '*',
    component: NotFound,
  });
}, -1);

// Create the router instance
const router = routerFactory.create();
export default router;
