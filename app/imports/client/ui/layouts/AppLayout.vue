<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <Sidebar />
    </v-navigation-drawer>
    <router-view name="toolbar" />
    <v-app-bar
      v-if="!$route.matched[0] || !$route.matched[0].components.toolbar"
      app
      color="secondary"
      dark
      :extended="$vuetify.breakpoint.smAndUp"
      :tabs="$vuetify.breakpoint.smAndUp"
      dense
    >
      <v-app-bar-nav-icon @click="toggleDrawer" />
      <v-toolbar-title>
        <v-fade-transition mode="out-in">
          <div :key="$store.state.pageTitle">
            {{ $store.state.pageTitle }}
          </div>
        </v-fade-transition>
      </v-toolbar-title>
      <v-spacer />
      <v-fade-transition mode="out-in">
        <div
          :key="$route.meta.title"
          style="
        text-overflow: ellipsis;
        overflow: hidden;"
        >
          <router-view name="toolbarItems" />
        </div>
      </v-fade-transition>
      <v-fade-transition
        v-if="$vuetify.breakpoint.smAndUp"
        slot="extension"
        mode="out-in"
      >
        <div
          :key="$route.meta.title"
          style="width: 100%"
        >
          <router-view name="toolbarExtension" />
        </div>
      </v-fade-transition>
    </v-app-bar>
    <v-main>
      <connection-banner />
      <v-fade-transition hide-on-leave>
        <router-view />
      </v-fade-transition>
    </v-main>
    <router-view name="rightDrawer" />
    <dialog-stack />
    <snackbar-queue />
  </v-app>
</template>

<script lang="js">
import '/imports/api/users/Users';
import Sidebar from '/imports/client/ui/layouts/Sidebar.vue';
import DialogStack from '/imports/client/ui/dialogStack/DialogStack.vue';
import { mapMutations } from 'vuex';
import SnackbarQueue from '/imports/client/ui/components/snackbars/SnackbarQueue.vue';
import ConnectionBanner from '/imports/client/ui/layouts/ConnectionBanner.vue';

export default {
  components: {
    Sidebar,
    DialogStack,
    SnackbarQueue,
    ConnectionBanner,
  },
  data() {
    return {
      name: 'Home',
      tabs: 0,
    }
  },
  computed: {
    drawer: {
      get() {
        return this.$store.state.drawer;
      },
      set(value) {
        this.$store.commit('setDrawer', value);
      },
    },
  },
  meteor: {
    darkMode() {
      let user = Meteor.user();
      if (!user) return null;
      return user.darkMode;
    },
  },
  watch: {
    darkMode: {
      immediate: true,
      handler(newDarkModeValue) {
        if (typeof newDarkModeValue === 'boolean') {
          this.$vuetify.theme.dark = newDarkModeValue;
        } else {
          const deviceDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          this.$vuetify.theme.dark = !!deviceDarkMode;
        }
      },
    },
    '$route'(to) {
      this.$store.commit('setPageTitle', to.meta && to.meta.title || 'DiceCloud');
    }
  },
  mounted() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (typeof this.darkMode === 'boolean') return;
      this.$vuetify.theme.dark = !!e.matches;
    });
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
