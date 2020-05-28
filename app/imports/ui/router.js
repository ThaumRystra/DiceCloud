import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2';
import LAUNCH_DATE from '/imports/constants/LAUNCH_DATE.js';
import { acceptInviteToken } from '/imports/api/users/Invites.js';

// Components
import Home from '/imports/ui/pages/Home.vue';
import About from '/imports/ui/pages/About.vue';
import CharacterList from '/imports/ui/pages/CharacterList.vue';
import Library from '/imports/ui/pages/Library.vue';
import SingleLibraryPage from '/imports/ui/pages/SingleLibraryPage.vue'
import SingleLibraryToolbarItems from '/imports/ui/library/SingleLibraryToolbarItems.vue'
import CharacterSheetPage from '/imports/ui/pages/CharacterSheetPage.vue';
import CharacterSheetToolbarItems from '/imports/ui/creature/character/CharacterSheetToolbarItems.vue';
import CharacterSheetToolbarExtension from '/imports/ui/creature/character/CharacterSheetToolbarExtension.vue';
import SignIn from '/imports/ui/pages/SignIn.vue' ;
import Register from '/imports/ui/pages/Register.vue';
import Friends from '/imports/ui/pages/Friends.vue' ;
import Feedback from '/imports/ui/pages/Feedback.vue' ;
import Account from '/imports/ui/pages/Account.vue' ;
import InviteSuccess from '/imports/ui/pages/InviteSuccess.vue' ;
import InviteError from '/imports/ui/pages/InviteError.vue' ;
import NotImplemented from '/imports/ui/pages/NotImplemented.vue';
import PatreonLevelTooLow from '/imports/ui/pages/PatreonLevelTooLow.vue';
import LaunchCountdown from '/imports/ui/pages/LaunchCountdown.vue';

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
        next({ name: 'signIn', query: { redirect: to.path} });
      }
    }
  });
}

function claimInvite(to, from, next){
  Tracker.autorun((computation) => {
    if (userSubscription.ready()){
      computation.stop();
      const user = Meteor.user();
      if (user){
        let inviteToken = to.params.inviteToken;
        acceptInviteToken.call({
          inviteToken
        }, (error) => {
          if (error){
            next({name: 'inviteError', params: {error}});
          } else {
            next('/invite-success')
          }
        });
      } else {
        next({ name: 'signIn', query: { redirect: to.path} });
      }
    }
  });
}

RouterFactory.configure(factory => {
  factory.addRoutes([
    {
      path: '/countdown',
      name: 'Countdown',
      components: {
        default: LaunchCountdown,
      },
      meta: {
        title: 'Countdown to Launch',
      },
    },{
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
      beforeEnter: ensureLoggedIn,
    },{
      path: '/library',
      components: {
        default: Library,
      },
      meta: {
        title: 'Library',
      },
      beforeEnter: ensureLoggedIn,
    },{
      name: 'singleLibrary',
      path: '/library/:id',
      components: {
        default: SingleLibraryPage,
        toolbarItems: SingleLibraryToolbarItems,
      },
      meta: {
        title: 'Library',
      },
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
    },{
      path: '/friends',
      components: {
        default: NotImplemented,
      },
      meta: {
        title: 'Friends',
      },
      beforeEnter: ensureLoggedIn,
    },{
      name: 'signIn',
			path: '/sign-in',
      components: {
        default: SignIn,
      },
      meta: {
        title: 'Sign In',
      },
		},{
      name: 'register',
			path: '/register',
      components: {
        default: Register,
      },
      meta: {
        title: 'Register',
      },
		},{
			path: '/account',
      components: {
        default: Account,
      },
      meta: {
        title: 'Account',
      },
      beforeEnter: ensureLoggedIn,
		},{
      path: '/feedback',
      components: {
        default: Feedback,
      },
      meta: {
        title: 'Feedback',
      },
    },{
      path: '/about',
      components: {
        default: About,
      },
      meta: {
        title: 'About DiceCloud',
      },
    },{
      path: '/invite/:inviteToken',
      beforeEnter: claimInvite,
    },{
      name: 'inviteError',
      path: '/invite-error',
      components: {
        default: InviteError,
      },
      props: {
        default: true,
      },
      meta: {
        title: 'Invite Error',
      },
    },{
      path: '/invite-success',
      components: {
        default: InviteSuccess,
      },
      meta: {
        title: 'Invite Success',
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
router.beforeEach((to, from, next) => {
  let user = Meteor.user();
  if (
    to.path === '/countdown' ||
    to.path === '/sign-in' ||
    (user && user.roles && user.roles.includes('admin'))
  ){
    next();
  } else if (new Date() < LAUNCH_DATE){
    next('/countdown');
  } else {
    next();
  }
});
export default router;
