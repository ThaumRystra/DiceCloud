<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        {{ $t('LibraryBrowserDialog.rEief-McLI6QrOAmbFPFz') }}
      </v-toolbar-title>
    </template>
    <library-browser slot="unwrapped-content" />
    <template slot="actions">
      <v-spacer />
      <v-btn
        text
        @click="$store.dispatch('popDialogStack')"
      >
        {{ $t('ShareDialog.K1khMUyWf8QUMXhNncQ6S') }}
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import LibraryBrowser from '/imports/client/ui/pages/LibraryBrowser.vue';

export default {
  components: {
    DialogBase,
    LibraryBrowser,
  },
};
</script>

<style lang="css" scoped>

</style>
