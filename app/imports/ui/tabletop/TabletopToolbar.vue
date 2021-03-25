<template lang="html">
  <v-toolbar
    app
    color="secondary"
    dark
    dense
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-toolbar-title>
      Tabletop
    </v-toolbar-title>
    <v-spacer />
  </v-toolbar>
</template>

<script lang="js">
import { mapMutations } from 'vuex';

export default {
  methods: {
    ...mapMutations([
      'toggleDrawer',
    ]),
  }
}
</script>

<style lang="css" scoped>
</style>
