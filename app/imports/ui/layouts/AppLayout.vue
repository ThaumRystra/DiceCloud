<template>
  <v-app light>
    <v-navigation-drawer app v-model="drawer">
      <Sidebar></Sidebar>
    </v-navigation-drawer>
    <router-view></router-view>
  </v-app>
</template>

<script>
  import Sidebar from "/imports/ui/components/Sidebar.vue";
  export default {
    computed: {
      drawer: {
        get () {
          return this.$store.state.drawer;
        },
        set (value) {
          this.$store.commit('setDrawer', value);
        },
      }
    },
    components: {
      Sidebar,
    },
  };
</script>

<style>

</style>
