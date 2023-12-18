<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Transfer Ownership
    </v-toolbar-title>
    <v-alert
      type="error"
      outlined
    >
      <template v-if="error">
        <p>
          {{ error }}
        </p>
      </template>
      <template v-else>
        <p>
          Are you sure you want to transfer ownership to {{ user.username || user._id }}?
        </p><p>
          This can only be undone by the user you are transferring ownership to.
        </p><p>
          You will still have edit permission.
        </p>
      </template>
    </v-alert>
    <v-layout justify-center>
      <v-btn
        color="accent"
        @click="transfer"
      >
        Transfer
        <template v-if="user.username">
          to {{ user.username }}
        </template>
      </v-btn>
    </v-layout>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { transferOwnership } from '/imports/api/sharing/sharing';

export default {
  components: {
    DialogBase,
  },
  props: {
    docRef: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  data(){ return {
    error: undefined,
  }},
  methods: {
    transfer(){
      transferOwnership.call({
        docRef: this.docRef,
        userId: this.user._id
      }, error => {
        if (!error){
          this.error = undefined;
          this.$store.dispatch('popDialogStack')
          return;
        }
        this.error = error.reason || error.message || error.toString();
      });
    },
  },
}
</script>

<style lang="css" scoped>
</style>
