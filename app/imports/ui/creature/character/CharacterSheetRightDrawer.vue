<template lang="html">
  <v-navigation-drawer
    v-model="drawer"
    app
    right
    clipped
  >
    <log-tab :creature-id="$route.params.id" />
  </v-navigation-drawer>
</template>

<script>
import LogTab from '/imports/ui/log/CharacterLog.vue';
export default {
  components: {
    LogTab,
  },
  computed: {
    drawer: {
      get () {
        return this.$store.state.rightDrawer;
      },
      set (value) {
        this.$store.commit('setRightDrawer', value);
      },
    },
  },
}
</script>

<style lang="css" scoped>
</style>
