import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2';
import { getEntitledCentsOfUser } from '/imports/api/users/Users.js';

// Components
import Home from '/imports/ui/pages/Home.vue';
import CharacterList from '/imports/ui/pages/CharacterList.vue';
import Library from '/imports/ui/pages/Library.vue';
import CharacterSheetPage from '/imports/ui/pages/CharacterSheetPage.vue';
import CharacterSheetToolbarItems from '/imports/ui/creature/character/CharacterSheetToolbarItems.vue';
import CharacterSheetToolbarExtension from '/imports/ui/creature/character/CharacterSheetToolbarExtension.vue';
import SignIn from '/imports/ui/pages/SignIn.vue' ;
import Register from '/imports/ui/pages/Register.vue';
import Friends from '/imports/ui/pages/Friends.vue' ;
import Account from '/imports/ui/pages/Account.vue' ;
import NotImplemented from '/imports/ui/pages/NotImplemented.vue';
import PatreonLevelTooLow from '/imports/ui/pages/PatreonLevelTooLow.vue';

let userSubscription = Meteor.subscribe('user');

// Not found
import NotFound from '/imports/ui/pages/NotFound.vue';

// Create router instance
const routerFactory = new RouterFactory({
  mode: 'history',
  scrollBehavior: nativeScrollBehavior,
});

function ensureLoggedIn(to, from, next){
  Tracker.autorun((computation) => {
    if (userSubscription.ready()){
      computation.stop();
      const user = Meteor.user();
      if (user){
        next()
      } else {
        next('/sign-in');
      }
    }
  });
}

function ensurePatronTier5(to, from, next){
  Tracker.autorun((computation) => {
    if (userSubscription.ready()){
      computation.stop();
      const user = Meteor.user();
      if (!user){
        next('/sign-in');
        return;
      }
      let entitledCents = getEntitledCentsOfUser(user);
      if (entitledCents < 500){
        next('/patreon-level-too-low');
      } else {
        next();
      }
    }
  });
}

RouterFactory.configure(factory => {
  factory.addRoutes([
    {
      path: '/',
      name: 'home',
      components: {
        default: Home,
      },
      meta: {
        title: 'Home',
      },
    },{
      path: '/characterList',
      components: {
        default: CharacterList,
      },
      meta: {
        title: 'Character List',
      },
      beforeEnter: ensurePatronTier5,
    },{
      path: '/library',
      components: {
        default: Library,
      },
      meta: {
        title: 'Library',
      },
      beforeEnter: ensurePatronTier5,
    },{
      path: '/character/:id/:urlName',
      components: {
        default: CharacterSheetPage,
        toolbarExtension: CharacterSheetToolbarExtension,
        toolbarItems: CharacterSheetToolbarItems,
      },
      meta: {
        title: 'Character Sheet',
      },
      beforeEnter: ensurePatronTier5,
    },{
      path: '/character/:id',
      components: {
        default: CharacterSheetPage,
        toolbarExtension: CharacterSheetToolbarExtension,
        toolbarItems: CharacterSheetToolbarItems,
      },
      meta: {
        title: 'Character Sheet',
      },
      beforeEnter: ensurePatronTier5,
    },{
      path: '/friends',
      components: {
        default: Friends,
      },
      meta: {
        title: 'Friends',
      },
      beforeEnter: ensureLoggedIn,
    },{
			path: '/sign-in',
      components: {
        default: SignIn,
      },
      meta: {
        title: 'Sign In',
      },
		},/*{
			path: '/register',
      components: {
        default: Register,
      },
      meta: {
        title: 'Home',
      },
		},*/{
			path: '/account',
      components: {
        default: Account,
      },
      meta: {
        title: 'Account',
      },
		},{
      path: '/feedback',
      components: {
        default: NotImplemented,
      },
      meta: {
        title: 'Feedback',
      },
    },{
      path: '/patreon-level-too-low',
      components: {
        default: PatreonLevelTooLow,
      },
      meta: {
        title: 'Patreon Tier Too Low',
      },
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
