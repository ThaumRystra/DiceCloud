<script setup lang="ts">
import { inject } from 'vue';
import { useStore } from 'vuex';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  model: Record<string, any>;
}>();

const context = inject('context', {} as any);
const store = useStore(key);

function fillSlot() {
  const slotId = props.model._id;
  const creatureId = (context).creatureId;
  store.commit('pushDialogStack', {
    component: 'slot-fill-dialog',
    elementId: `slot-add-button-${slotId}`,
    data: {
      slotId,
      creatureId,
    },
    async callback(nodeIds: string[]) {
      if (!nodeIds || !nodeIds.length) return;
      const newPropertyId = await insertPropertyFromLibraryNode.callAsync({
        nodeIds,
        parentRef: {
          'id': slotId,
          'collection': 'creatureProperties',
        },
      });
      return `slot-child-${newPropertyId}`;
    },
  });
}
</script>

<template>
  <v-btn
    v-if="!model.quantityExpected || !model.quantityExpected.value || model.spaceLeft"
    :icon="!$slots.default"
    v-bind="$attrs"
    :data-id="`slot-add-button-${model._id}`"
    class="slot-add-button text-accent"
    @click.stop="fillSlot()"
  >
    <slot>
      <v-icon>mdi-plus</v-icon>
    </slot>
  </v-btn>
</template>

<style></style>
