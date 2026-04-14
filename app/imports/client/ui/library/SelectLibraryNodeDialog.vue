<script setup lang="ts">
import { ref } from 'vue';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import LibraryAndNode from '/imports/client/ui/library/LibraryAndNode.vue';

const node = ref<any>(undefined);
</script>

<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        Select Library Property
      </v-toolbar-title>
    </template>
    <template #unwrapped-content>
      <library-and-node
        style="height: 100%;"
        selection
        @selected="val => node = val"
      />
    </template>
    <template #actions>
      <v-btn
        variant="text"
        color="primary"
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        @click="$store.dispatch('popDialogStack', node)"
      >
        Select
      </v-btn>
    </template>
  </dialog-base>
</template>

<style lang="css" scoped>
</style>
