<template>
  <v-container>
    <v-row
      justify="center"
      class="mt-2"
    >
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
        <v-col
          key="upload"
          cols="12"
          md="4"
          lg="3"
          class="layout column justify-center"
        >
          <input
            ref="archiveFileInput"
            type="file"
            accept=".json"
            style="display: none;"
            @input="inputArchiveFile"
          >
          <v-btn
            outlined
            style="height: 100%; width: 100%;"
            :color="archiveFileError ? 'error' : undefined"
            @click="$refs.archiveFileInput.click()"
          >
            <v-icon left>
              mdi-file-upload-outline
            </v-icon>
            <template v-if="archiveFileError">
              {{ archiveFileError }}
            </template>
            <template v-else>
              Upload archive
            </template>
          </v-btn>
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
    archiveFileError: undefined,
    archiveFile: undefined,
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
  methods: {
    inputArchiveFile(){
      this.archiveFile = undefined;
      this.archiveFileError = undefined;
      const file = this.$refs.archiveFileInput.files[0];
      if (!file) return;
      if (file.type !== 'application/json'){
        this.archiveFileError = 'File must be .json';
        return;
      }
      if (file.size > 10000000){
        this.archiveFileError = 'File too large';
        return;
      }
      this.archiveFile = file;
      console.log(this.archiveFile);
    }
  },
}
</script>
