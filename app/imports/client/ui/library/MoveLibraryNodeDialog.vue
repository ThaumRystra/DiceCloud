<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Select new location
    </v-toolbar-title>
    <library-and-node
      slot="unwrapped-content"
      style="height: 100%;"
      selection
      @selected="val => node = val"
    />
    <template slot="actions">
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="$store.dispatch('popDialogStack', node._id)"
      >
        {{ action || 'Move' }}
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import LibraryAndNode from '/imports/client/ui/library/LibraryAndNode.vue';
export default {
  components: {
    DialogBase,
    LibraryAndNode,
  },
  props: {
    action: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      node: undefined,
    };
  },
};
</script>
