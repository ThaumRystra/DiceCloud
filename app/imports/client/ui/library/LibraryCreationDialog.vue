<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        New Library
      </v-toolbar-title>
    </template>
    <text-field
      label="Name"
      :value="library.name"
      :debounce-time="0"
      @change="nameChanged"
    />
    <text-area
      label="Description"
      :value="library.description"
      :debounce-time="0"
      @change="descriptionChanged"
    />
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        :disabled="!valid"
        @click="$store.dispatch('popDialogStack', library)"
      >
        Insert Library
      </v-btn>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';

const library = ref({
  name: 'New Library',
  description: undefined as string | undefined,
});
const valid = ref(true);

function nameChanged(val: string, ack: (error?: string) => void) {
  if (val) {
    library.value.name = val;
    valid.value = true;
    ack();
  } else {
    valid.value = false;
    ack('Name is required');
  }
}

function descriptionChanged(val: string, ack: () => void) {
  library.value.description = val;
  ack();
}
</script>

<style lang="css" scoped>

</style>
