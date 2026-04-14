<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import TabletopLog from '/imports/client/ui/log/TabletopLog.vue';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);

const drawer = computed({
  get() {
    return store.state.rightDrawer;
  },
  set(value) {
    store.commit('setRightDrawer', value);
  },
});
</script>

<template lang="html">
  <v-navigation-drawer
    v-model="drawer"
    location="right"
  >
    <tabletop-log :tabletop-id="$route.params.id" />
  </v-navigation-drawer>
</template>

<style lang="css" scoped></style>
