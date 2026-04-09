<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        Add Characters
      </v-toolbar-title>
    </template>
    <v-list>
      <p v-if="!creatures.length">
        There are no creatures to add or you have already added them all
      </p>
      <creature-list-tile
        v-for="creature in creatures"
        :key="creature._id"
        :model="creature"
        :is-selected="selected.includes(creature._id)"
        selection
        @click="toggleSelect(creature._id)"
      />
    </v-list>
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        @click="$store.dispatch('popDialogStack', selected)"
      >
        Add characters
      </v-btn>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureListTile from '/imports/client/ui/creature/creatureList/CreatureListTile.vue';

const props = defineProps<{
  startingSelection?: any[];
}>();

const selected = ref<string[]>([]);

const { result: creatures } = autorun(() =>
  Creatures.find({ _id: { $nin: props.startingSelection ?? [] } })
);

function toggleSelect(id: string) {
  const index = selected.value.indexOf(id);
  if (index === -1) {
    selected.value.push(id);
  } else {
    selected.value.splice(index, 1);
  }
}
</script>

<style lang="css" scoped>
</style>
