<template>
  <v-breadcrumbs
    :items="items"
    divider=">"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Docs from '/imports/api/docs/Docs';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

const props = defineProps<{
  doc?: any;
}>();

const items = computed(() => {
  const items: any[] = [{ text: 'Docs', to: '/docs', exact: true }];
  if (!props.doc) return items;

  const ancestors = Docs.find({ ...getFilter.ancestors(props.doc) }).fetch();
  ancestors.forEach((a: any) => {
    items.push({ text: a.name, to: a.href, exact: true });
  });
  items.push({ text: props.doc.name, to: props.doc.href, exact: true });
  return items;
});
</script>
