<template lang="html">
  <VueDraggable
    v-model="dataCreatures"
    style="min-height: 24px;"
    :sort="false"
    :group="`creature-list`"
    ghost-class="ghost"
    draggable=".creature"
    handle=".handle"
    @update="draggableChange"
    @add="draggableChange"
  >
    <creature-list-tile
      v-for="creature in dataCreatures"
      :key="creature._id"
      class="creature"
      :model="creature"
      :selection="selection"
      :is-selected="selectedCreature === creature._id || selectedCreatures.has(creature._id)"
      v-bind="selection ? {} : {to: creature.url}"
      :dense="dense"
      :data-id="dense ? undefined : creature._id"
      @click="$emit('creature-selected', creature._id)"
    />
  </VueDraggable>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import CreatureListTile from '/imports/client/ui/creature/creatureList/CreatureListTile.vue';
import { VueDraggable } from 'vue-draggable-plus';
import moveCreatureToFolder from '/imports/api/creature/creatureFolders/methods.js/moveCreatureToFolder';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

const props = defineProps<{
  creatures: any[];
  folderId?: string | null;
  selection?: boolean;
  selectedCreature?: string;
  selectedCreatures?: Set<string>;
  dense?: boolean;
}>();

defineEmits<{ (e: 'creature-selected', id: string): void }>();

const dataCreatures = ref<any[]>([]);

watch(() => props.creatures, (newValue) => {
  dataCreatures.value = newValue;
});

onMounted(() => {
  dataCreatures.value = props.creatures;
});

async function draggableChange(event: any) {
  const doc = event.data;
  if (doc) {
    try {
      await moveCreatureToFolder.callAsync({
        creatureId: doc._id,
        folderId: props.folderId ?? null,
      });
    } catch (error: any) {
      console.error(error);
      snackbar({ text: error.reason });
    }
  }
}
</script>

<style lang="css" scoped>
</style>
