<template>
  <v-col
    cols="12"
    md="4"
    lg="3"
    class="layout column justify-center align-center"
  >
    <v-progress-circular
      :rotate="-90"
      :size="100"
      :width="15"
      :value="percentFileStorageUsed"
      :buffer-value="50"
      color="accent"
    >
      {{ percentFileStorageUsed }}%
    </v-progress-circular>
    <div class="ma-2 mt-4">
      {{ prettyBytes(storageUsed) }} / {{ prettyBytes(storageAllowed) }}
      <v-btn
        icon
        @click="updateStorageUsed"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>
  </v-col>
</template>

<script lang="js">
import { getUserTier } from '/imports/api/users/patreon/tiers';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import updateFileStorageUsed from '/imports/api/users/methods/updateFileStorageUsed';
import prettyBytes from 'pretty-bytes';

export default {
   meteor: {
    storageUsed(){
      return Meteor.user().fileStorageUsed || 0;
    },
    storageAllowed(){
      return getUserTier(Meteor.userId()).fileStorage * 1000000;
    },
    percentFileStorageUsed(){
      return Math.round((this.storageUsed / this.storageAllowed) * 100);
    },
  },
    methods: {
    prettyBytes(input){
      return prettyBytes(input)
    },
    updateStorageUsed(){
      this.updateStorageUsedLoading = true;
      updateFileStorageUsed.call(error => {
        this.updateStorageUsedLoading = false;
        if (!error) return;
        snackbar({text: error.reason});
      });
    },
  },
}
</script>

<style>

</style>