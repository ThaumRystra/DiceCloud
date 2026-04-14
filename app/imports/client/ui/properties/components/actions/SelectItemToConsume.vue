<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import ItemTreeNode from '/imports/client/ui/properties/treeNodeViews/ItemTreeNode.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import selectAmmoItem from '/imports/api/creature/creatureProperties/methods/selectAmmoItem';
import { findIndex } from 'lodash';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

const props = defineProps<{
  action: Record<string, any>;
  itemConsumed: Record<string, any>;
}>();

const { result: items } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.action.root.id),
    type: 'item',
    tags: props.itemConsumed.tag,
    removed: { $ne: true },
    inactive: { $ne: true },
  }, {
    sort: { left: 1 },
    fields: { equipped: false },
  }).fetchAsync()
);

async function selectItem(itemId: string) {
  const itemConsumedIndex = findIndex(
    props.action.resources.itemsConsumed,
    (item: any) => item._id === props.itemConsumed._id
  );
  try {
    await selectAmmoItem.callAsync({
      actionId: props.action._id,
      itemId,
      itemConsumedIndex,
    });
  } catch (error) {
    console.error(error);
  }
}
</script>

<template lang="html">
  <v-list v-if="items.length">
    <v-list-item
      v-for="item in items"
      :key="item._id"
      @click="selectItem(item._id)"
    >
      <item-tree-node
        :model="item"
        :selected="itemConsumed.itemId === item._id"
      />
    </v-list-item>
  </v-list>
  <v-card v-else>
    <v-card-text>
      No active items found with the tag "{{ itemConsumed.tag }}"
    </v-card-text>
  </v-card>
</template>

<style lang="css" scoped>
</style>
