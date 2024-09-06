<template>
  <div
    v-bind="$attrs"
    class="d-flex flex-column "
  >
    <v-btn
      outlined
      block
      class="image-upload-button flex-grow-1"
      v-bind="$attrs"
      style="min-height: 64px;"
      :loading="uploadingInProgress"
      @click="$refs.hiddenFileInput.click()"
    >
      <v-icon left>
        mdi-file-upload-outline
      </v-icon>
      <div>
        Upload Image
      </div>
      <template #loader>
        <v-progress-circular
          :value="progress"
          :indeterminate="uploadIndeterminate"
        />
      </template>
      <input
        ref="hiddenFileInput"
        type="file"
        accept="image/*"
        style="display: none;"
        @input="inputChange"
      >
    </v-btn>
    <v-alert
      v-if="fileUploadError"
      outlined
      type="error"
      class="mb-0 mt-4"
    >
      {{ fileUploadError }}
    </v-alert>
  </div>
</template>

<script lang="js">
import UserImages from '/imports/api/files/userImages/UserImages';
import getThumbHash from '/imports/client/ui/utility/getThumbHash.js'

export default {
  data(){return {
    progress: 0,
    file: undefined,
    uploadingInProgress: false,
    fileUploadError: undefined,
  }},
  watch: {
    async file(file){
      if (!file) return;
      let self = this;
      let thumbHash = undefined;

      // Start the loading state here, because we are loading and processing the image into
      // a thumb hash
      self.uploadingInProgress = true;
      self.uploadIndeterminate = true;

      // ThumbHashes are nice to have, but don't break upload if they fail
      try {
        thumbHash = await getThumbHash(file);
      } catch (e) {
        console.error('Failed to generate thumbHash')
        console.error(e);
      }

      // Start the image insert process
      const uploadInstance = UserImages.insert({
        file: file,
        chunkSize: 'dynamic',
        allowWebWorkers: true,
        meta: {
          createdAt: new Date(),
          thumbHash,
        },
      }, false);

      uploadInstance.on('start', function () {
        console.log('start')
        self.progress = 0;
        self.uploadIndeterminate = false;
        // Remove errors
        self.fileUploadError = undefined;
      });

      uploadInstance.on('end', function (error, fileObj) {
        console.log('end', error)
        self.resetState();
        self.$emit('uploaded', UserImages.link(fileObj));
      });

      uploadInstance.on('uploaded', function (error, fileObj) {
        console.log('uploaded')
        self.progress = 0;
      });

      uploadInstance.on('error', function (error, fileObj) {
        console.log('error', error)
        self.fileUploadError = error.reason || error.message || error.toString();
      });

      uploadInstance.on('progress', function (progress, fileObj) {
        // Update our progress bar with actual progress
        console.log('progress')
        self.uploadIndeterminate = false;
        self.progress = progress;
      });

      try {
        uploadInstance.start(); // Must manually start the upload
      } catch (error) {
        self.fileUploadError = error.reason || error.message || error.toString();
        self.resetState();
      }
    },
  },
  methods: {
    inputChange(e) {
      if (!e.target) return;
      const { files: selectedFiles } = e.target;
      if (!selectedFiles) return;
      this.file = selectedFiles[0];
      return;
    },
    resetState() {
      // Remove file from input
      this.file = undefined;
      this.$refs.hiddenFileInput.value = '';
      // stop progress
      this.uploadingInProgress = false;
      this.progress = 0;
    },
  },

}
</script>

<style>

</style>