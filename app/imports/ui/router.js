import { RouterFactory, nativeScrollBehavior } from 'meteor/akryum:vue-router2';
import Vue from 'vue';

// Components
import Home from '/imports/ui/pages/Home.vue';
import CharacterList from '/imports/ui/pages/CharacterList.vue';
import Libraries from '/imports/ui/pages/Libraries.vue';
import CharacterSheetPage from '/imports/ui/pages/CharacterSheetPage.vue';
import SignIn from '/imports/ui/pages/SignIn.vue' ;
import Register from '/imports/ui/pages/Register.vue' ;
import Account from '/imports/ui/pages/Account.vue' ;

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
      path: '/character/:id/:urlName',
      component: CharacterSheetPage,
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
		},
  ]);
  //Development routes
  if (Meteor.isDevelopment){
    let StoryBook = require('/imports/ui/StoryBook.vue').default;
    let IconAdmin = require('/imports/ui/icons/IconAdmin.vue').default;
    factory.addRoutes([
      {
        path: '/storybook/:component',
        name: 'componentStory',
        component: StoryBook,
      },{
        path: '/storybook',
        name: 'storybook',
        component: StoryBook,
      }, {
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
