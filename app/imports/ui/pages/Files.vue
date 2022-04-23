<template>
  <v-container>
    <v-row justify="center">
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
    </v-row>
    <v-row dense>
      <template v-if="archiveFiles && archiveFiles.length">
        <v-col cols="12">
          <v-subheader> Archived Characters </v-subheader>
        </v-col>
        <v-col
          v-for="file in archiveFiles"
          :key="file._id"
          cols="12"
          md="4"
          lg="3"
        >
          <archive-file-card :model="file" />
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script lang="js">
import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles.js';
import prettyBytes from 'pretty-bytes';
import ArchiveFileCard from '/imports/ui/files/ArchiveFileCard.vue';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';
import { snackbar } from '/imports/ui/components/snackbars/SnackbarQueue.js';
import updateFileStorageUsed from '/imports/api/users/methods/updateFileStorageUsed.js';

export default {
  components: {
    ArchiveFileCard,
  },
  data(){ return {
    updateStorageUsedLoading: false,
  }},
  meteor: {
    $subscribe: {
      'archiveCreatureFiles': [],
      'characterList': [],
    },
    storageUsed(){
      return Meteor.user().fileStorageUsed || 0;
    },
    storageAllowed(){
      return getUserTier(Meteor.userId()).fileStorage * 1000000;
    },
    percentFileStorageUsed(){
      return Math.round((this.storageUsed / this.storageAllowed) * 100);
    },
    archiveFiles() {
      var userId = Meteor.userId();
      return ArchiveCreatureFiles.find(
        {
          userId,
        }, {
          sort: {'size': -1},
        }
      ).map(f => {
        f.size = prettyBytes(f.size);
        f.link = ArchiveCreatureFiles.link(f);
        return f;
      });
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
