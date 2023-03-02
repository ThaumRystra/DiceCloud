<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    right
    clipped
  >
    <character-log :creature-id="$route.params.id" />
  </v-navigation-drawer>
</template>

<script>
import CharacterLog from '/imports/client/ui/log/CharacterLog.vue';
export default {
  components: {
    CharacterLog,
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
