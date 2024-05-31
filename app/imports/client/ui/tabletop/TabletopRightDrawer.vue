<template lang="html">
  <v-navigation-drawer
    v-model="drawer"
    app
    right
    clipped
  >
    <tabletop-log :tabletop-id="$route.params.id" />
  </v-navigation-drawer>
</template>

<script lang="js">
import TabletopLog from '/imports/client/ui/log/TabletopLog.vue';
export default {
  components: {
    TabletopLog,
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
