import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2';
import { acceptInviteToken } from '/imports/api/users/Invites';
import MAINTENANCE_MODE from '/imports/constants/MAINTENANCE_MODE';
import i18n from '/imports/client/ui/i18n';

// Components
const Home = () => import('/imports/client/ui/pages/Home.vue');
const About = () => import('/imports/client/ui/pages/About.vue');
const CharacterList = () => import('/imports/client/ui/pages/CharacterList.vue');
const CharacterListToolbarItems = () => import('/imports/client/ui/creature/creatureList/CharacterListToolbarItems.vue');
const Library = () => import('/imports/client/ui/pages/Library.vue');
const LibraryCollection = () => import('/imports/client/ui/pages/LibraryCollection.vue');
const LibraryCollectionToolbar = () => import('/imports/client/ui/library/LibraryCollectionToolbar.vue');
const LibraryBrowser = () => import('/imports/client/ui/pages/LibraryBrowser.vue');
const CharacterSheetPage = () => import('/imports/client/ui/pages/CharacterSheetPage.vue');
const CharacterSheetToolbar = () => import('/imports/client/ui/creature/character/CharacterSheetToolbar.vue');
const CharacterSheetRightDrawer = () => import('/imports/client/ui/creature/character/CharacterSheetRightDrawer.vue');
const CharacterSheetPrinted = () => import('/imports/client/ui/creature/character/printedCharacterSheet/CharacterSheetPrinted.vue');
const CharacterSheetPrintedToolbar = () => import('/imports/client/ui/creature/character/printedCharacterSheet/CharacterSheetPrintedToolbar.vue');
const SignIn = () => import('/imports/client/ui/pages/SignIn.vue');
const Register = () => import('/imports/client/ui/pages/Register.vue');
const IconAdmin = () => import('/imports/client/ui/icons/IconAdmin.vue');
const Feedback = () => import('/imports/client/ui/pages/Feedback.vue');
const FunctionReference = () => import('/imports/client/ui/pages/FunctionReference.vue');
const Account = () => import('/imports/client/ui/pages/Account.vue');
const InviteSuccess = () => import('/imports/client/ui/pages/InviteSuccess.vue');
const InviteError = () => import('/imports/client/ui/pages/InviteError.vue');
const EmailVerificationSuccess = () => import('/imports/client/ui/pages/EmailVerificationSuccess.vue');
const EmailVerificationError = () => import('/imports/client/ui/pages/EmailVerificationError.vue');
const ResetPassword = () => import('/imports/client/ui/pages/ResetPassword.vue');
const NotImplemented = () => import('/imports/client/ui/pages/NotImplemented.vue');
const PatreonLevelTooLow = () => import('/imports/client/ui/pages/PatreonLevelTooLow.vue');
const SingleLibrary = () => import('/imports/client/ui/pages/SingleLibrary.vue');
const SingleLibraryToolbar = () => import('/imports/client/ui/library/SingleLibraryToolbar.vue');
const Tabletops = () => import('/imports/client/ui/pages/Tabletops.vue');
const Tabletop = () => import('/imports/client/ui/pages/Tabletop.vue');
const TabletopToolbar = () => import('/imports/client/ui/tabletop/TabletopToolbar.vue');
const Admin = () => import('/imports/client/ui/pages/Admin.vue');
const Maintenance = () => import('/imports/client/ui/pages/Maintenance.vue');
const Files = () => import('/imports/client/ui/pages/Files.vue');
const DocsPage = () => import('/imports/client/ui/pages/DocsPage.vue');
const DocToolbar = () => import('/imports/client/ui/docs/DocToolbar.vue');
const DocsRightDrawer = () => import('/imports/client/ui/docs/DocsRightDrawer.vue');

// Not found
const NotFound = () => import('/imports/client/ui/pages/NotFound.vue');

let userSubscription = Meteor.subscribe('user');

// Create router instance
const routerFactory = new RouterFactory({
  mode: 'history',
  scrollBehavior: nativeScrollBehavior,
});

function ensureLoggedIn(to, from, next) {
  Tracker.autorun((computation) => {
    if (userSubscription.ready()) {
      computation.stop();
      const user = Meteor.user();
      if (user) {
        next();
      } else {
        next({ name: 'signIn', query: { redirect: to.path } });
      }
    }
  });
}

function ensureAdmin(to, from, next) {
  Tracker.autorun((computation) => {
    if (userSubscription.ready()) {
      computation.stop();
      const user = Meteor.user();
      if (user) {
        if (user.roles && user.roles.includes('admin')) {
          next();
        } else {
          next({ name: 'home' });
        }
      } else {
        next({ name: 'signIn', query: { redirect: to.path } });
      }
    }
  });
}

function claimInvite(to, from, next) {
  Tracker.autorun((computation) => {
    if (userSubscription.ready()) {
      computation.stop();
      const user = Meteor.user();
      if (user) {
        let inviteToken = to.params.inviteToken;
        acceptInviteToken.call({
          inviteToken,
        }, (error) => {
          if (error) {
            next({ name: 'inviteError', params: { error } });
          } else {
            next('/invite-success');
          }
        });
      } else {
        next({ name: 'signIn', query: { redirect: to.path } });
      }
    }
  });
}

function verifyEmail(to, from, next) {
  const token = to.params.token;
  Accounts.verifyEmail(token, (error) => {
    if (error) {
      next({ name: 'emailVerificationError', params: { error } });
    } else {
      next('/email-verification-success');
    }
  });
}

RouterFactory.configure((router) => {
  router.addRoutes([{
    path: '/',
    name: 'home',
    components: {
      default: Home,
    },
    meta: {
      title: i18n.t('Maintenance.xn1iabUyQAcN50064OLqt'),
    },
  }, {
    path: '/character-list',
    alias: '/characterList',
    components: {
      default: CharacterList,
      toolbarItems: CharacterListToolbarItems,
    },
    meta: {
      title: i18n.t('router.W2umY4yHN_krdS1Fail1K'),
    },
    beforeEnter: ensureLoggedIn,
  }, {
    name: 'library',
    path: '/library',
    components: {
      default: Library,
    },
    meta: {
      title: i18n.t('SingleLibrary.8o8zfT4rnslD95pstr578'),
    },
    beforeEnter: ensureLoggedIn,
  }, {
    name: 'singleLibrary',
    path: '/library/:id',
    components: {
      default: SingleLibrary,
      toolbar: SingleLibraryToolbar,
    },
    meta: {
      title: i18n.t('SingleLibrary.8o8zfT4rnslD95pstr578'),
    },
  }, {
    name: 'libraryCollection',
    path: '/library-collection/:id',
    components: {
      default: LibraryCollection,
      toolbar: LibraryCollectionToolbar,
    },
    meta: {
      title: i18n.t('router.cPNbp74fWaIGYG1yzE2fL'),
    },
  }, {
    name: 'libraryBrowser',
    path: '/community-libraries',
    components: {
      default: LibraryBrowser,
    },
    meta: {
      title: i18n.t('LibraryBrowserDialog.rEief-McLI6QrOAmbFPFz'),
    },
  }, {
    name: 'characterSheet',
    path: '/character/:id',
    alias: '/character/:id/:urlName',
    components: {
      default: CharacterSheetPage,
      toolbar: CharacterSheetToolbar,
      rightDrawer: CharacterSheetRightDrawer,
    },
    meta: {
      title: i18n.t('HelpDialog.Klueb_dCWM-dqLDCnrAvc'),
    },
  }, {
    name: 'printCharacterSheet',
    path: '/print-character/:id',
    alias: '/print-character/:id/:urlName',
    components: {
      default: CharacterSheetPrinted,
      toolbar: CharacterSheetPrintedToolbar,
    },
    meta: {
      title: i18n.t('CharacterSheetPrinted.6dUbDHnCRivEyMA8sIaHp'),
    },
  }, {
    path: '/tabletops',
    name: 'tabletops',
    component: Tabletops,
    beforeEnter: ensureLoggedIn,
    meta: {
      title: i18n.t('Sidebar.lO8RxJFgOO2O9Sl2b1pxT'),
    },
  }, {
    path: '/tabletop/:id',
    name: 'tabletop',
    components: {
      default: Tabletop,
      toolbar: TabletopToolbar,
    },
    beforeEnter: ensureLoggedIn,
  }, {
    path: '/friends',
    components: {
      default: NotImplemented,
    },
    meta: {
      title: i18n.t('Friends.LPnKzu_iwEkWKHDp0SVmF'),
    },
    beforeEnter: ensureLoggedIn,
  }, {
    name: 'signIn',
    path: '/sign-in',
    components: {
      default: SignIn,
    },
    meta: {
      title: i18n.t('Home.Q8kGqjMJQ66X0YCH3JT0g'),
    },
  }, {
    name: 'register',
    path: '/register',
    components: {
      default: Register,
    },
    meta: {
      title: i18n.t('Home.Y7uTRbv5hbEkIplOp6-XF'),
    },
  }, {
    path: '/account',
    components: {
      default: Account,
    },
    meta: {
      title: i18n.t('router.EJunS06DZiQ-VbPaO-GL2'),
    },
    beforeEnter: ensureLoggedIn,
  }, {
    path: '/my-files',
    components: {
      default: Files,
    },
    meta: {
      title: i18n.t('Sidebar.BPQym8QzWFodXZjtBNfdd'),
    },
    beforeEnter: ensureLoggedIn,
  }, {
    path: '/feedback',
    components: {
      default: Feedback,
    },
    meta: {
      title: i18n.t('Sidebar.pxf1SzERzQzKgl3Anfi1F'),
    },
  }, {
    path: '/docs/functions',
    components: {
      default: FunctionReference,
    },
    meta: {
      title: i18n.t('FunctionReference.yTQBDcPtnTzcmAEOzeDj9'),
    },
  }, {
    path: '/docs/:docPath([^/]+.*)?',
    components: {
      default: DocsPage,
      toolbar: DocToolbar,
      rightDrawer: DocsRightDrawer,
    },
    meta: {
      title: i18n.t('DocsPage.owEFuhKAi0S5XmhIaiqMB'),
    },
  }, {
    path: '/about',
    components: {
      default: About,
    },
    meta: {
      title: i18n.t('router.Q3ZSspM1tZouuBzoLcY0_'),
    },
  }, {
    path: '/invite/:inviteToken',
    beforeEnter: claimInvite,
  }, {
    path: '/verify-email/:token',
    beforeEnter: verifyEmail,
  }, {
    name: 'inviteError',
    path: '/invite-error',
    components: {
      default: InviteError,
    },
    props: {
      default: true,
    },
    meta: {
      title: i18n.t('InviteError.W-8EMJsBuzqRMZC3GzCdm'),
    },
  }, {
    path: '/invite-success',
    components: {
      default: InviteSuccess,
    },
    meta: {
      title: i18n.t('InviteSuccess.myoQ_oeTcPO92TLbFBVvu'),
    },
  }, {
    name: 'emailVerificationError',
    path: '/email-verification-error',
    components: {
      default: EmailVerificationError,
    },
    props: {
      default: true,
    },
    meta: {
      title: i18n.t('EmailVerificationError.dGAlXt2C_CR8kggghnqSK'),
    },
  }, {
    path: '/email-verification-success',
    components: {
      default: EmailVerificationSuccess,
    },
    meta: {
      title: i18n.t('router.leDI9g43CHfjO_JBc7DYC'),
    },
  }, {
    path: '/reset-password/:token?',
    components: {
      default: ResetPassword,
    },
    meta: {
      title: i18n.t('ResetPassword.OtXdcuhNszD9-49yGdYKR'),
    },
  }, {
    path: '/patreon-level-too-low',
    components: {
      default: PatreonLevelTooLow,
    },
    meta: {
      title: i18n.t('router.viCm_a4Ir-pKkn0xY_HPc'),
    },
  }, {
    path: '/icon-admin',
    name: 'iconAdmin',
    component: IconAdmin,
    beforeEnter: ensureAdmin,
  }, {
    path: '/admin',
    name: 'admin',
    component: Admin,
    beforeEnter: ensureAdmin,
  }, {
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

function redirectIfMaintenance(to, from, next) {
  if (!MAINTENANCE_MODE) return next();
  if (
    to?.path === '/admin' ||
    to?.path === '/maintenance' ||
    to?.path === '/sign-in'
  ) return next();
  Tracker.autorun((computation) => {
    if (userSubscription.ready()) {
      computation.stop();
      const user = Meteor.user();
      if (user && user.roles && user.roles.includes('admin')) {
        next({ name: 'admin' })
      } else {
        next({ name: 'maintenance' });
      }
    }
  });
}

// Create the router instance
const router = routerFactory.create();
router.beforeEach(redirectIfMaintenance);
export default router;
