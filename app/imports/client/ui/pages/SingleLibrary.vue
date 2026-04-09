<template lang="html">
  <single-card-layout>
    <library-and-node
      :library-id="route.params.id"
    />
  </single-card-layout>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
import SingleCardLayout from '/imports/client/ui/layouts/SingleCardLayout.vue';
import LibraryAndNode from '/imports/client/ui/library/LibraryAndNode.vue';
import Libraries from '/imports/api/library/Libraries';

const store = useStore();
const route = useRoute();

const { result: library } = autorun(() => {
  const libraryId = route.params.id as string;
  if (!libraryId) return undefined;
  return Libraries.findOne(libraryId, { fields: { name: 1 } });
});

watch(() => (library.value as any)?.name, (newName) => {
  store.commit('setPageTitle', newName || 'Library');
});

onMounted(() => {
  store.commit('setPageTitle', (library.value as any)?.name || 'Library');
});
</script>
