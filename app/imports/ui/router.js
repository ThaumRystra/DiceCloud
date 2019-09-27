import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2';
import Vue from 'vue';

// Components
import Home from '/imports/ui/pages/Home.vue';
import CharacterList from '/imports/ui/pages/CharacterList.vue';
import Libraries from '/imports/ui/pages/Libraries.vue';
import Library from '/imports/ui/pages/Library.vue';
import CharacterSheetPage from '/imports/ui/pages/CharacterSheetPage.vue';
import SignIn from '/imports/ui/pages/SignIn.vue' ;
import Register from '/imports/ui/pages/Register.vue' ;
import Account from '/imports/ui/pages/Account.vue' ;
import NotImplemented from '/imports/ui/pages/NotImplemented.vue';

// Not found
import NotFound from '/imports/ui/pages/NotFound.vue';


// Create router instance
const routerFactory = new RouterFactory({
  mode: 'history',
  scrollBehavior: nativeScrollBehavior,
});


RouterFactory.configure(factory => {
  factory.addRoutes([
    {
      path: '/',
      name: 'home',
      component: Home,
    },{
      path: '/characterList',
      component: CharacterList,
    },{
      path: '/library',
      component: Libraries,
    },{
      path: '/library/:id',
      component: Library,
    },{
      path: '/character/:id/:urlName',
      component: CharacterSheetPage,
      //component: NotImplemented,
    },{
      path: '/character/:id',
      component: CharacterSheetPage,
    },{
			path: '/sign-in',
			component: SignIn,
		},{
			path: '/register',
			component: Register,
		},{
			path: '/account',
			component: Account,
		},{
      path: '/feedback',
      component: NotImplemented,
    },
  ]);
  // Storybook routes
  if (Meteor.settings.public.showStorybook || Meteor.isDevelopment){
    let StoryBook = require('/imports/ui/StoryBook.vue').default;
    factory.addRoutes([
      {
        path: '/storybook/:component',
        name: 'componentStory',
        component: StoryBook,
      },{
        path: '/storybook',
        name: 'storybook',
        component: StoryBook,
      },
    ]);
  }
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
