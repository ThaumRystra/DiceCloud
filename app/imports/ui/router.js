import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2';

// Components
import Home from '/imports/ui/pages/Home.vue';
import CharacterList from '/imports/ui/pages/CharacterList.vue';
import Library from '/imports/ui/pages/Library.vue';
import CharacterSheetPage from '/imports/ui/pages/CharacterSheetPage.vue';
import SignIn from '/imports/ui/pages/SignIn.vue' ;
import Register from '/imports/ui/pages/Register.vue' ;
import Account from '/imports/ui/pages/Account.vue' ;
import NotImplemented from '/imports/ui/pages/NotImplemented.vue';
import PatreonLevelTooLow from '/imports/ui/pages/PatreonLevelTooLow.vue';

// Not found
import NotFound from '/imports/ui/pages/NotFound.vue';


// Create router instance
const routerFactory = new RouterFactory({
  mode: 'history',
  scrollBehavior: nativeScrollBehavior,
});

function ensurePatronTier(to, from, next){
  let user = Meteor.user();
  if (!user){
    next('/sign-in');
    return;
  }
  let entitledCents = user.services.patreon.entitledCents || 0;
  let overrideCents = user.services.patreon.entitledCentsOverride || 0;
  
  if (entitledCents < 500 && overrideCents < 500){
    next('/patreon-level-too-low');
  } else {
    next();
  }
}

RouterFactory.configure(factory => {
  factory.addRoutes([
    {
      path: '/',
      name: 'home',
      component: Home,
    },{
      path: '/characterList',
      component: CharacterList,
      beforeEnter: ensurePatronTier,
    },{
      path: '/library',
      component: Library,
      beforeEnter: ensurePatronTier,
    },{
      path: '/character/:id/:urlName',
      component: CharacterSheetPage,
      beforeEnter: ensurePatronTier,
    },{
      path: '/character/:id',
      component: CharacterSheetPage,
      beforeEnter: ensurePatronTier,
    },{
			path: '/sign-in',
			component: SignIn,
		},/*{
			path: '/register',
			component: Register,
		},*/{
			path: '/account',
			component: Account,
		},{
      path: '/feedback',
      component: NotImplemented,
    },{
      path: '/patreon-level-too-low',
      component: PatreonLevelTooLow,
    },
  ]);
  // Icon admin routes
  if (Meteor.isDevelopment){
    let IconAdmin = require('/imports/ui/icons/IconAdmin.vue').default;
    factory.addRoutes([
      {
        path: '/icon-admin',
        name: 'iconAdmin',
        component: IconAdmin,
      },
    ]);
  }
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
