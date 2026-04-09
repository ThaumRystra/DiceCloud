<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        Community Libraries
      </v-toolbar-title>
    </template>
    <template #unwrapped-content>
      <library-browser />
    </template>
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        @click="$store.dispatch('popDialogStack')"
      >
        Done
      </v-btn>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import LibraryBrowser from '/imports/client/ui/pages/LibraryBrowser.vue';
</script>

<style lang="css" scoped>

</style>
