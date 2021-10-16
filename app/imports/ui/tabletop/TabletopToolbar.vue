<template lang="html">
  <v-app-bar
    app
    dark
    clipped-right
    dense
    color="secondary"
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-toolbar-title>
      Tabletop
    </v-toolbar-title>
    <v-spacer />
    <v-app-bar-nav-icon @click="toggleRightDrawer" />
  </v-app-bar>
</template>

<script lang="js">
import { mapMutations } from 'vuex';

export default {
  methods: {
    ...mapMutations([
      'toggleDrawer',
      'toggleRightDrawer',
    ]),
  }
}
</script>

<style lang="css" scoped>
</style>
