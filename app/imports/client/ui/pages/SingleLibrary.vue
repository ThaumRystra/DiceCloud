<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
import SingleCardLayout from '/imports/client/ui/layouts/SingleCardLayout.vue';
import LibraryAndNode from '/imports/client/ui/library/LibraryAndNode.vue';
import Libraries from '/imports/api/library/Libraries';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);
const route = useRoute();

const { result: library } = autorun(() => {
  const libraryId = route.params.id as string;
  if (!libraryId) return undefined;
  return Libraries.findOne(libraryId, { fields: { name: 1 } });
});

watch(() => (library.value)?.name, (newName) => {
  store.commit('setPageTitle', newName || 'Library');
});

onMounted(() => {
  store.commit('setPageTitle', (library.value)?.name || 'Library');
});
</script>

<template lang="html">
  <single-card-layout>
    <library-and-node :library-id="route.params.id" />
  </single-card-layout>
</template>
