<template>
  <div
    v-if="model.name || (properties && properties.length)"
  >
    <v-card
      class="folder-group-card pb-2"
    >
      <v-list-subheader v-if="model.name">
        {{ model.name }}
      </v-list-subheader>
      <component
        :is="propComponents[prop.type]"
        v-for="prop in properties"
        :key="prop._id"
        :model="prop"
        :data-id="prop._id"
        @click="$emit('click-property', {_id: prop._id})"
        @click-property="e => $emit('click-property', e)"
        @sub-click="e => $emit('sub-click', e)"
        @remove="id => $emit('remove', id || prop._id)"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import propComponents from '/imports/client/ui/properties/components/folders/propertyComponentIndex';

const props = defineProps<{
  model: Record<string, any>;
}>();

const { result: properties } = autorun(() => {
  const result: any[] = [];
  CreatureProperties.find({
    'parentId': props.model._id,
    removed: { $ne: true },
    overridden: { $ne: true },
    $or: [
      {
        type: 'toggle',
        showUI: true,
        deactivatedByAncestor: { $ne: true },
        deactivatedByToggle: { $ne: true },
      },
      {
        type: { $ne: 'toggle' },
        inactive: { $ne: true },
      },
    ],
    $nor: [
      { hideWhenTotalZero: true, total: 0 },
      { hideWhenValueZero: true, value: 0 },
    ],
  }, {
    sort: { left: 1 },
  }).forEach((prop: any) => {
    if ((propComponents as any)[prop.type]) {
      result.push(prop);
    }
  });
  return result;
});
</script>

<style>
.folder-group-card .v-card {
  box-shadow: none !important;
  border-radius: 0 !important;
}
.folder-group-card .drag-handle {
  display: none !important;
}
</style>
