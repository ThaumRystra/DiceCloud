<template lang="html">
  <v-list
    density="compact"
    class="item-list"
  >
    <VueDraggable
      v-model="dataItems"
      style="min-height: 24px;"
      :disabled="context.editPermission === false"
      :group="`item-list`"
      ghost-class="ghost"
      draggable=".item"
      handle=".handle"
      :revert-on-spill="true"
      @update="change"
      @add="change"
    >
      <item-list-tile
        v-for="itemId in dataItems"
        :key="itemId"
        class="item"
        :data-id="itemId"
        :item-id="itemId"
        @click="clickProperty(itemId)"
      />
    </VueDraggable>
  </v-list>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, inject } from 'vue';
import { useStore } from 'vuex';
import { VueDraggable } from 'vue-draggable-plus';
import ItemListTile from '/imports/client/ui/properties/components/inventory/ItemListTile.vue';
import { moveWithinRoot } from '/imports/api/parenting/organizeMethods';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  itemIds?: string[];
  parent?: Record<string, any>;
  preparingSpells?: boolean;
  equipment?: boolean;
}>(), {
  itemIds: () => [],
  parent: undefined,
  preparingSpells: false,
  equipment: false,
});

const context = inject('context', {} as any);
const store = useStore(key);
const dataItems = ref<string[]>([]);

onMounted(() => {
  dataItems.value = props.itemIds;
});

watch(() => props.itemIds, (value) => {
  dataItems.value = value;
});

function clickProperty(_id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: _id,
    data: { _id },
  });
}

async function change(event: any) {
  if (!event.data) return;
  let order: number;
  const newIndex = event.newIndex;
  const beforeId = dataItems.value[newIndex - 1];
  const afterId = dataItems.value[newIndex + 1];
  const before = beforeId && CreatureProperties.findOne(beforeId);
  const after = afterId && CreatureProperties.findOne(afterId);
  if (before) {
    order = before.right + 0.5;
  } else if (after) {
    order = after.left - 0.5;
  } else if (props.parent) {
    order = props.parent.left + 0.5;
  } else {
    order = 0.5;
  }
  const docId = event.data;
  const doc = CreatureProperties.findOne(docId);
  if (!doc) return;
  try {
    await moveWithinRoot.callAsync({
      docRef: {
        id: docId,
        collection: 'creatureProperties',
      },
      newPosition: order,
    });
  } catch (e: any) {
    console.error(e);
    snackbar({ text: e.reason || e.message || e.toString() });
  }
  if (doc.type === 'item' && doc.equipped !== props.equipment) {
    try {
      await updateCreatureProperty.callAsync({
        _id: docId,
        path: ['equipped'],
        value: !!props.equipment,
      });
    } catch (e: any) {
      dataItems.value = props.itemIds;
      console.error(e);
      snackbar({ text: e.reason || e.message || e.toString() });
    }
  }
}
</script>

<style lang="css" scoped>
.ghost {
  opacity: 0.1;
}
</style>
