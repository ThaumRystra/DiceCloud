import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2';
import { acceptInviteToken } from '/imports/api/users/Invites.js';
import MAINTENANCE_MODE from '/imports/constants/MAINTENANCE_MODE.js';
// Components
const Home = () => import('/imports/ui/pages/Home.vue');
const About = () => import('/imports/ui/pages/About.vue');
const CharacterList = () => import('/imports/ui/pages/CharacterList.vue');
const CharacterListToolbarItems = () => import('/imports/ui/creature/creatureList/CharacterListToolbarItems.vue');
const Library = () => import('/imports/ui/pages/Library.vue');
const SingleLibraryToolbar = () => import('/imports/ui/library/SingleLibraryToolbar.vue');
const CharacterSheetPage = () => import('/imports/ui/pages/CharacterSheetPage.vue');
const CharacterSheetToolbar = () => import('/imports/ui/creature/character/CharacterSheetToolbar.vue');
const CharacterSheetRightDrawer = () => import('/imports/ui/creature/character/CharacterSheetRightDrawer.vue');
const SignIn = () => import('/imports/ui/pages/SignIn.vue' );
const Register = () => import('/imports/ui/pages/Register.vue');
const IconAdmin = () => import('/imports/ui/icons/IconAdmin.vue');
//const Friends = () => import('/imports/ui/pages/Friends.vue' );
const Feedback = () => import('/imports/ui/pages/Feedback.vue' );
const Account = () => import('/imports/ui/pages/Account.vue' );
const InviteSuccess = () => import('/imports/ui/pages/InviteSuccess.vue' );
const InviteError = () => import('/imports/ui/pages/InviteError.vue' );
const EmailVerificationSuccess = () => import('/imports/ui/pages/EmailVerificationSuccess.vue' );
const EmailVerificationError = () => import('/imports/ui/pages/EmailVerificationError.vue' );
const ResetPassword = () => import('/imports/ui/pages/ResetPassword.vue' );
const NotImplemented = () => import('/imports/ui/pages/NotImplemented.vue');
const PatreonLevelTooLow = () => import('/imports/ui/pages/PatreonLevelTooLow.vue');
const Tabletops = () => import('/imports/ui/pages/Tabletops.vue');
const Tabletop = () => import('/imports/ui/pages/Tabletop.vue');
const TabletopToolbar = () => import('/imports/ui/tabletop/TabletopToolbar.vue');
const TabletopRightDrawer = () => import('/imports/ui/tabletop/TabletopRightDrawer.vue');
const Admin = () => import('/imports/ui/pages/Admin.vue');
const Maintenance = () => import('/imports/ui/pages/Maintenance.vue');
const Files = () => import('/imports/ui/pages/Files.vue');

// Not found
const NotFound = () => import('/imports/ui/pages/NotFound.vue');

let userSubscription = Meteor.subscribe('user');

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

function verifyEmail(to, from, next){
  const token = to.params.token;
  Accounts.verifyEmail(token, error => {
    if (error){
      next({name: 'emailVerificationError', params: {error}});
    } else {
      next('/email-verification-success')
    }
  });
}

RouterFactory.configure(router => {
  router.addRoutes([{
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
        rightDrawer: TabletopRightDrawer,
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
    }, {
      path: '/account',
      components: {
        default: Account,
      },
      meta: {
        title: 'Account',
      },
      beforeEnter: ensureLoggedIn,
    }, {
      path: '/my-files',
      components: {
        default: Files,
      },
      meta: {
        title: 'Files',
      },
      beforeEnter: ensureLoggedIn,
    }, {
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
      path: '/verify-email/:token',
      beforeEnter: verifyEmail,
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
      name: 'emailVerificationError',
      path: '/email-verification-error',
      components: {
        default: EmailVerificationError,
      },
      props: {
        default: true,
      },
      meta: {
        title: 'Email Verification Error',
      },
    },{
      path: '/email-verification-success',
      components: {
        default: EmailVerificationSuccess,
      },
      meta: {
        title: 'Email Verification Success',
      },
    },{
      path: '/reset-password/:token?',
      components: {
        default: ResetPassword,
      },
      meta: {
        title: 'Reset Password',
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
    },{
      path: '/admin',
      name: 'admin',
      component: Admin,
      beforeEnter: ensureAdmin,
    },{
      path: '/maintenance',
      name: 'maintenance',
      component: Maintenance,
    },
  ]);
});

// Not found route has lowest priority
RouterFactory.configure(router => {
  router.addRoute({
    path: '*',
    component: NotFound,
  });
}, -1);

function redirectIfMaintenance(to, from, next){
  if (!MAINTENANCE_MODE) return next();
  if (to?.path === '/admin' || to?.path === '/maintenance' || to?.path === '/sign-in') return next();
  Tracker.autorun((computation) => {
    if (userSubscription.ready()){
      computation.stop();
      const user = Meteor.user();
      if (user && user.roles && user.roles.includes('admin')){
        next({name: 'admin'})
      } else {
        next({name: 'maintenance'});
      }
    }
  });
}

// Create the router instance
const router = routerFactory.create();
router.beforeEach(redirectIfMaintenance);
export default router;
