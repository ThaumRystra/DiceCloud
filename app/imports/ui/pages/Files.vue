<template>
  <v-container>
    <v-row justify="center">
      <file-storage-stats />
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
import FileStorageStats from '/imports/ui/files/FileStorageStats.vue';

export default {
  components: {
    ArchiveFileCard,
    FileStorageStats,
  },
  data(){ return {
    updateStorageUsedLoading: false,
  }},
  meteor: {
    $subscribe: {
      'archiveCreatureFiles': [],
      'characterList': [],
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
}
</script>
