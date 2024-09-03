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
          class="archive-button"
          :color="archiveFileError ? 'error' : undefined"
          :disabled="archiveUploadInProgress"
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
            :value="archiveUploadProgress"
            :indeterminate="archiveUploadIndeterminate"
          />
        </v-btn>
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
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-subheader> Images </v-subheader>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
      >
        <image-upload-input
          style="height: 100%; width: 100%; min-height: 120px;"
        />
      </v-col>
      <template v-if="imageFiles && imageFiles.length">
        <v-col
          v-for="file in imageFiles"
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
    </v-col>
  </v-container>
</template>

<script lang="js">
import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles';
import UserImages from '/imports/api/files/userImages/UserImages';
import prettyBytes from 'pretty-bytes';
import ArchiveFileCard from '/imports/client/ui/files/ArchiveFileCard.vue';
import FileStorageStats from '/imports/client/ui/files/FileStorageStats.vue';
import ImageUploadInput from '/imports/client/ui/components/ImageUploadInput.vue';
import UserImageCard from '/imports/client/ui/files/userImages/UserImageCard.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { archiveSchema } from '/imports/api/creature/archive/ArchiveCreatureFiles';
import migrateArchive from '/imports/migrations/archive/migrateArchive';
import ImageField from '/imports/client/ui/properties/viewers/shared/ImageField.vue';
import SmartImageInput from '/imports/client/ui/components/global/SmartImageInput.vue';

// TODO Mark files that don't have versions.${version}.meta.pipePath set as broken links
// TODO show user images
// TODO delete, rename, etc. user images

export default {
  components: {
    ArchiveFileCard,
    FileStorageStats,
    UserImageCard,
    ImageUploadInput,
  },
  data(){ return {
    updateStorageUsedLoading: false,
    archiveFileError: undefined,
    archiveFile: undefined,
    archiveUploadInProgress: false,
    archiveUploadProgress: 0,
    archiveUploadIndeterminate: true,
    inputImageHref: 'https://picsum.photos/2000/500',
  }},
  meteor: {
    $subscribe: {
      'archiveCreatureFiles': [],
      'userImages': [],
      'characterList': [],
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
    imageFiles() {
      const userId = Meteor.userId();
      return UserImages.find(
        {
          userId,
        }, {
          sort: {
            'meta.createdAt': -1,
            'name': 1,
            'size': -1,
          },
        }
      ).map(f => {
        f.size = prettyBytes(f.size);
        f.link = UserImages.link(f);
        return f;
      });
    },
  },
  watch: {
    archiveUploadInProgress(val){
      if (val === false) {
        this.archiveUploadProgress = 0;
        this.archiveUploadIndeterminate = true;
      }
    },
  },
  methods: {
    inputArchiveFile(){
      this.archiveFile = undefined;
      this.archiveFileError = undefined;
      const file = this.$refs.archiveFileInput.files[0];
      // Reset the file input
      this.$refs.archiveFileInput.value = null;
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
      this.archiveUploadInProgress = true;
      this.archiveUploadProgress = undefined;

      const fr = new FileReader();
      const self = this;

      fr.addEventListener('load', () => {
        let data;
        try {
          data = JSON.parse(fr.result);
        } catch (e){
          self.archiveFileError = 'File could not be parsed';
          self.archiveUploadInProgress = false;
          console.error(e);
          return;
        }
        try {
          // Migrate, clean, and validate the archive
          migrateArchive(data);
          data = archiveSchema.clean(data);
          archiveSchema.validate(data);
        } catch (e){
          self.archiveFileError = 'File failed validation: ' + (e.reason || e.message || e.toString());
          self.archiveUploadInProgress = false;
          console.error(e);
          return;
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
          self.archiveUploadIndeterminate = false;
        });

        uploadInstance.on('end', function (error, fileObj) {
          self.archiveUploadInProgress = false;
        });

        uploadInstance.on('uploaded', function (error, fileObj) {
          // Remove the file from the input box
          self.file = undefined;

          // Reset our state for the next file
          self.archiveUploadInProgress = false;
        });

        uploadInstance.on('error', function (error, fileObj) {
          const text = error.reason || error.message || error;
          snackbar({text});
          self.archiveFileError = text;
          self.archiveUploadInProgress = false;
        });

        uploadInstance.on('progress', function (progress, fileObj) {
          self.archiveUploadProgress = progress;
        });

        uploadInstance.start();
      });

      fr.readAsText(file);
    }
  },
}
</script>

<style>
  .v-btn.archive-button > .v-btn__content {
    white-space: normal;
    max-width: 100%;
  }
</style>
