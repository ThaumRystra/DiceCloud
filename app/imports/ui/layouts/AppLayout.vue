<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <Sidebar />
    </v-navigation-drawer>
    <router-view
      name="toolbar"
    />
    <v-app-bar
      v-if="!$route.matched[0] || !$route.matched[0].components.toolbar"
      app
      color="secondary"
      dark
      tabs
      dense
    >
      <v-app-bar-nav-icon @click="toggleDrawer" />
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
            name="toolbarExtension"
          />
        </div>
      </v-fade-transition>
    </v-app-bar>
    <v-main>
      <v-fade-transition
        mode="out-in"
      >
        <router-view />
      </v-fade-transition>
    </v-main>
    <router-view
      name="rightDrawer"
    />
    <dialog-stack />
    <snackbar-queue />
  </v-app>
</template>

<script lang="js">
	import '/imports/api/users/Users.js';
  import Sidebar from '/imports/ui/layouts/Sidebar.vue';
  import DialogStack from '/imports/ui/dialogStack/DialogStack.vue';
  import { mapMutations } from 'vuex';
  import SnackbarQueue from '/imports/ui/components/snackbars/SnackbarQueue.vue';

  export default {
    components: {
      Sidebar,
      DialogStack,
      SnackbarQueue,
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
          if (typeof newDarkModeValue === 'boolean'){
            this.$vuetify.theme.dark = newDarkModeValue;
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
