import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2';
import { acceptInviteToken } from '/imports/api/users/Invites.js';

// Components
import Home from '/imports/ui/pages/Home.vue';
import About from '/imports/ui/pages/About.vue';
import CharacterList from '/imports/ui/pages/CharacterList.vue';
import CharacterListToolbarItems from '/imports/ui/creature/creatureList/CharacterListToolbarItems.vue';
import Library from '/imports/ui/pages/Library.vue';
import SingleLibraryToolbar from '/imports/ui/library/SingleLibraryToolbar.vue';
import CharacterSheetPage from '/imports/ui/pages/CharacterSheetPage.vue';
import CharacterSheetPrintPage from '/imports/ui/pages/CharacterSheetPrintPage.vue';
import CharacterSheetToolbar from '/imports/ui/creature/character/CharacterSheetToolbar.vue';
import CharacterSheetRightDrawer from '/imports/ui/creature/character/CharacterSheetRightDrawer.vue';
import SignIn from '/imports/ui/pages/SignIn.vue' ;
import Register from '/imports/ui/pages/Register.vue';
import IconAdmin from '/imports/ui/icons/IconAdmin.vue';
//import Friends from '/imports/ui/pages/Friends.vue' ;
import Feedback from '/imports/ui/pages/Feedback.vue' ;
import Account from '/imports/ui/pages/Account.vue' ;
import InviteSuccess from '/imports/ui/pages/InviteSuccess.vue' ;
import InviteError from '/imports/ui/pages/InviteError.vue' ;
import NotImplemented from '/imports/ui/pages/NotImplemented.vue';
import PatreonLevelTooLow from '/imports/ui/pages/PatreonLevelTooLow.vue';
import Tabletops from '/imports/ui/pages/Tabletops.vue';
import Tabletop from '/imports/ui/pages/Tabletop.vue';
import TabletopToolbar from '/imports/ui/tabletop/TabletopToolbar.vue';

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

function ensureAdmin(to, from, next){
  Tracker.autorun((computation) => {
    if (userSubscription.ready()){
      computation.stop();
      const user = Meteor.user();
      if (user){
        if (user.roles && user.roles.includes('admin')){
          next()
        } else {
          next({name: 'home'});
        }
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
  factory.addRoutes([{
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
        toolbarItems: CharacterListToolbarItems,
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
        default: Library,
        toolbar: SingleLibraryToolbar,
      },
      meta: {
        title: 'Library',
      },
    },{
      path: '/character/:id',
      alias: '/character/:id/:urlName',
      components: {
        default: CharacterSheetPage,
        toolbar: CharacterSheetToolbar,
        rightDrawer: CharacterSheetRightDrawer,
      },
      meta: {
        title: 'Character Sheet',
      },
    },{
      path: '/characterPrint/:id/:urlName',
      components: {
        default: CharacterSheetPrintPage,
      },
      meta: {
        title: 'Character Sheet',
      },
    },{
      path: '/characterPrint/:id',
      components: {
        default: CharacterSheetPrintPage,
      },
      meta: {
        title: 'Character Sheet',
      },
    },{
      path: '/tabletops',
      name: 'tabletops',
      component: Tabletops,
      beforeEnter: ensureLoggedIn,
    },{
      path: '/tabletop/:id',
      name: 'tabletop',
      components: {
        default: Tabletop,
        toolbar: TabletopToolbar,
      },
      beforeEnter: ensureLoggedIn,
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
    },{
      path: '/icon-admin',
      name: 'iconAdmin',
      component: IconAdmin,
      beforeEnter: ensureAdmin,
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
router.beforeEach((to, from, next) => {
  let user = Meteor.user();
  if (
    to.path === '/sign-in' ||
    (user && user.roles && user.roles.includes('admin'))
  ){
    next();
  } else {
    next();
  }
});
export default router;
