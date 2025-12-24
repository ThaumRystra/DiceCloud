<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      {{ $t('transferOwnershipDialog.title') }}
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
          {{ $t('transferOwnershipDialog.areYouSure') }} {{ user.username || user._id }}?
        </p><p>
          {{ $t('transferOwnershipDialog.thisCannotBeUndone') }}
        </p><p>
          {{ $t('transferOwnershipDialog.youEditPermission') }}
        </p>
      </template>
    </v-alert>
    <v-layout justify-center>
      <v-btn
        color="accent"
        @click="transfer"
      >
        {{ $t('transferOwnershipDialog.confirm') }}
        <template v-if="user.username">
          {{ user.username }}
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
