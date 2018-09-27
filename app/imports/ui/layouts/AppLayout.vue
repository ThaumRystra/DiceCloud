<template>
  <v-app light>
    <v-navigation-drawer app v-model="drawer">
    </v-navigation-drawer>
    <router-view></router-view>
  </v-app>
</template>

<script>
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
    }
  };
</script>

<style>

</style>
