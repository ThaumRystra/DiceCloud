<template lang="html">
  <v-navigation-drawer
    v-model="drawer"
    location="right"
  >
    <character-log :creature-id="$route.params.id" />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import CharacterLog from '/imports/client/ui/log/CharacterLog.vue';

const store = useStore();

const drawer = computed({
  get() {
    return store.state.rightDrawer;
  },
  set(value) {
    store.commit('setRightDrawer', value);
  },
});
</script>

<style lang="css" scoped>
</style>
