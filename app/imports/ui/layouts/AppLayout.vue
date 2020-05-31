<template>
  <v-app
    :dark="darkMode"
    :light="!darkMode"
  >
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <Sidebar />
    </v-navigation-drawer>
    <router-view
      v-model="tabs"
      name="toolbar"
    />
    <v-toolbar
      v-if="!$route.matched[0].components.toolbar"
      app
      color="secondary"
      dark
      tabs
      dense
    >
      <v-toolbar-side-icon @click="toggleDrawer" />
      <v-toolbar-title>
        <v-fade-transition
          mode="out-in"
        >
          <div :key="$store.state.pageTitle">
            {{ $store.state.pageTitle }}
          </div>
        </v-fade-transition>
      </v-toolbar-title>
      <v-spacer />
      <v-fade-transition
        mode="out-in"
      >
        <div :key="$route.meta.title">
          <router-view
            name="toolbarItems"
          />
        </div>
      </v-fade-transition>
      <v-fade-transition
        slot="extension"
        mode="out-in"
      >
        <div
          :key="$route.meta.title"
          style="width: 100%"
        >
          <router-view
            v-model="tabs"
            name="toolbarExtension"
          />
        </div>
      </v-fade-transition>
    </v-toolbar>
    <v-content>
      <v-fade-transition
        mode="out-in"
      >
        <router-view :tabs.sync="tabs" />
      </v-fade-transition>
    </v-content>

    <dialog-stack />
  </v-app>
</template>

<script>
	import '/imports/api/users/Users.js';
  import Sidebar from '/imports/ui/layouts/Sidebar.vue';
  import DialogStack from '/imports/ui/dialogStack/DialogStack.vue';
	import { theme, darkTheme } from '/imports/ui/theme.js';
  import { mapMutations } from 'vuex';

  export default {
    components: {
      Sidebar,
      DialogStack,
    },
    data(){return {
      name: 'Home',
      tabs: 0,
    }},
    computed: {
      drawer: {
        get () {
          return this.$store.state.drawer;
        },
        set (value) {
          this.$store.commit('setDrawer', value);
        },
      },
    },
		meteor: {
			darkMode(){
				let user = Meteor.user();
				return user && user.darkMode;
			},
		},
		watch: {
			darkMode: {
				immediate: true,
				handler(newDarkModeValue){
					let newTheme = newDarkModeValue ? darkTheme : theme;
					for (let key in newTheme){
						this.$vuetify.theme[key] = newTheme[key];
					}
				},
			},
      '$route' (to) {
        this.$store.commit('setPageTitle', to.meta && to.meta.title || 'DiceCloud');
      }
		},
    methods: {
      ...mapMutations([
        'toggleDrawer',
      ]),
    },
  };
</script>

<style>
</style>
