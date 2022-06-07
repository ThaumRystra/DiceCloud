<template>
  <v-container>
    <v-row
      justify="center"
      class="mt-2"
    >
      <file-storage-stats />
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-subheader> Archived Characters </v-subheader>
      </v-col>
      <template v-if="archiveFiles && archiveFiles.length">
        <v-col
          v-for="file in archiveFiles"
          :key="file._id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <archive-file-card :model="file" />
        </v-col>
      </template>
      <v-col
        key="upload"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
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
          style="height: 100%; width: 100%; min-height: 120px;"
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
          <v-progress-linear
            v-if="archiveUploadInProgress"
            :progress="archiveUploadProgress"
            :indeterminate="archiveUploadIndeterminate"
          />
        </v-btn>
      </v-col>
    </v-row>
    <!--
    <v-row dense>
      <v-col cols="12">
        <v-subheader> Images </v-subheader>
      </v-col>
      <template v-if="userImages && userImages.length">
        <v-col
          v-for="file in userImages"
          :key="file._id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <user-image-card :model="file" />
        </v-col>
      </template>
      <v-col
        key="image-upload"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
        class="layout column justify-center"
      >
        <image-upload-input />
      </v-col>
    </v-row>
    -->
  </v-container>
</template>

<script lang="js">
import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles.js';
import UserImages from '/imports/api/files/UserImages.js';
import prettyBytes from 'pretty-bytes';
import ArchiveFileCard from '/imports/ui/files/ArchiveFileCard.vue';
import FileStorageStats from '/imports/ui/files/FileStorageStats.vue';
import ImageUploadInput from '/imports/ui/components/ImageUploadInput.vue';
import UserImageCard from '/imports/ui/files/UserImageCard.vue';
import { snackbar } from '/imports/ui/components/snackbars/SnackbarQueue.js';
import { archiveSchema } from '/imports/api/creature/archive/ArchiveCreatureFiles.js';

export default {
  components: {
    ArchiveFileCard,
    FileStorageStats,
    ImageUploadInput,
    UserImageCard,
  },
  data(){ return {
    updateStorageUsedLoading: false,
    archiveFileError: undefined,
    archiveFile: undefined,
    archiveUploadInProgress: false,
    archiveUploadProgress: undefined,
    archiveUploadIndeterminate: false,
  }},
  meteor: {
    $subscribe: {
      'archiveCreatureFiles': [],
      'characterList': [],
      'userImages': [],
    },
    archiveFiles() {
      const userId = Meteor.userId();
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
    userImages() {
      const userId = Meteor.userId();
      return UserImages.find({
        userId
      }, {
        sort: {
          size: -1
        },
      }).map(f => {
        f.size = prettyBytes(f.size);
        f.link = UserImages.link(f);
        return f;
      });
    }
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
      this.archiveUploadIndeterminate = true;

      const fr = new FileReader();
      const self = this;

      fr.addEventListener('load', () => {
        let data;
        try {
          data = JSON.parse(fr.result);
        } catch (e){
          self.archiveFileError = 'File could not be parsed';
        }
        console.log(data);
        try {
          archiveSchema.validate(data);
        } catch (e){
          self.archiveFileError = e.reason || e.message || e.toString();
        }

        let uploadInstance = ArchiveCreatureFiles.insert({
          file: file,
          meta: {
            creatureName: data?.creature?.name,
            userId: Meteor.userId()
          },
          chunkSize: 'dynamic',
          allowWebWorkers: true // If you see issues with uploads, change this to false
        }, false)

        // These are the event functions, don't need most of them, it shows where we are in the process
        uploadInstance.on('start', function () {
          console.log('Starting');
          self.archiveUploadIndeterminate = false;
          self.archiveUploadInProgress = true;
        });

        uploadInstance.on('end', function (error, fileObj) {
          console.log('On end File Object: ', fileObj);
          self.archiveUploadInProgress = false;
        });

        uploadInstance.on('uploaded', function (error, fileObj) {
          console.log('uploaded: ', fileObj);

          // Remove the file from the input box
          self.file = undefined;

          // Reset our state for the next file
          self.archiveUploadInProgress = false;
          self.archiveUploadProgress = 0;
        });

        uploadInstance.on('error', function (error, fileObj) {
          console.log('Error during upload: ' + error, fileObj)
          const text = error.reason || error.message || error;
          snackbar({text});
          self.archiveFileError = text;
        });

        uploadInstance.on('progress', function (progress, fileObj) {
          console.log('Upload Percentage: ' + progress, fileObj)
          // Update our progress bar
          self.archiveUploadProgress = progress;
        });

        uploadInstance.start(); // Must manually start the upload
      });

      fr.readAsText(file);
    }
  },
}
</script>
