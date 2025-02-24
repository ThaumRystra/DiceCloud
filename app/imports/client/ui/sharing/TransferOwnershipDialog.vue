<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      {{ $t('ShareDialog.or0_zrIkepecbBUj6uZpY') }}
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
        <div>
          <p>
            {{ $t('TransferOwnershipDialog.3ox8k9sufH6ntB2FWhQou', [user.username || user._id]) }}
          </p>
          <p>
            {{ $t('TransferOwnershipDialog.Px5OTlVYaC8IjfrwcXrps') }}
          </p>
          <p>
            {{ $t('TransferOwnershipDialog.S-8nlRJZE_thhIOIbPtJK') }}
          </p>
        </div>
      </template>
    </v-alert>
    <v-layout justify-center>
      <v-btn
        color="accent"
        @click="transfer"
      >
        {{ $t('TransferOwnershipDialog.JJ7wbGsjKaUUPzFuxA3mg') }}
        <template v-if="user.username">
          {{ $t('TransferOwnershipDialog.OCHfbjK5H12JX8OagYpm5', [user.username]) }}
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
