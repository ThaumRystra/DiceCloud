<script setup lang="ts">
import { ref } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import Libraries from '/imports/api/library/Libraries';

const libraryCollection = ref({
  name: 'New Collection',
  description: undefined as string | undefined,
  libraries: [] as string[],
});
const valid = ref(true);

const { result: libraryOptions } = autorun(() => {
  const userId = Meteor.userId();
  return Libraries.find(
    {
      $or: [
        { owner: userId },
        { writers: userId },
        { readers: userId },
        { public: true },
      ]
    },
    { sort: { name: 1 } }
  ).map((library: any) => ({ text: library.name, value: library._id }));
});

function nameChanged(val: string, ack: (error?: string) => void) {
  if (val) {
    libraryCollection.value.name = val;
    valid.value = true;
    ack();
  } else {
    valid.value = false;
    ack('Name is required');
  }
}

function descriptionChanged(val: string, ack: () => void) {
  libraryCollection.value.description = val;
  ack();
}

function librariesChanged(val: string[], ack: () => void) {
  libraryCollection.value.libraries = val;
  ack();
}
</script>

<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        New Collection
      </v-toolbar-title>
    </template>
    <template>
      <text-field
        label="Name"
        :value="libraryCollection.name"
        :debounce-time="0"
        @change="nameChanged"
      />
      <text-area
        label="Description"
        :value="libraryCollection.description"
        :debounce-time="0"
        @change="descriptionChanged"
      />
      <smart-select
        label="Libraries"
        :items="libraryOptions"
        :value="libraryCollection.libraries"
        :debounce-time="0"
        multiple
        chips
        deletable-chips
        no-data-text="No libraries found"
        @change="librariesChanged"
      />
    </template>
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        :disabled="!valid"
        @click="$store.dispatch('popDialogStack', libraryCollection)"
      >
        Insert Collection
      </v-btn>
    </template>
  </dialog-base>
</template>

<style lang="css" scoped>
</style>
