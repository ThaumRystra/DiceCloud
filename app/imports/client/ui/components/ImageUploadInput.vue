<template>
  <v-btn
    outlined
    class="image-upload-button"
    v-bind="$attrs"
    :color="fileUploadError ? 'error' : undefined"
    :disabled="uploadingInProgress"
    @click="$refs.hiddenFileInput.click()"
  >
    <v-icon left>
      mdi-file-upload-outline
    </v-icon>
    <template v-if="fileUploadError">
      {{ fileUploadError }}
    </template>
    <template v-else>
      Upload Image
    </template>
    <v-progress-linear
      v-if="uploadingInProgress"
      :value="progress"
      :indeterminate="uploadIndeterminate"
    />
    <input
      ref="hiddenFileInput"
      type="file"
      accept="image/*"
      style="display: none;"
      @input="inputChange"
    >
  </v-btn>
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
      let uploadInstance = UserImages.insert({
        file: file,
        chunkSize: 'dynamic',
        allowWebWorkers: true,
        meta: {
          createdAt: new Date(),
          thumbHash,
        },
      }, false);

      uploadInstance.on('start', function () {
        self.progress = 0;
        self.uploadIndeterminate = false;
      });

      uploadInstance.on('end', function (error, fileObj) {
        self.resetState();
        self.$emit('uploaded', UserImages.link(fileObj));
      });

      uploadInstance.on('uploaded', function (error, fileObj) {
        self.resetState();
        self.progress = 0;
      });

      uploadInstance.on('error', function (error, fileObj) {
        self.resetState();
        this.fileUploadError = error.reason || error.message || error.toString();
      });

      uploadInstance.on('progress', function (progress, fileObj) {
        // Update our progress bar with actual progress
        self.uploadIndeterminate = false;
        self.progress = progress;
      });

      uploadInstance.start(); // Must manually start the upload
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
      // stop progress
      this.uploadingInProgress = false;
      this.progress = 0;
      // Remove errors
      this.fileUploadError = undefined;
    },
  },

}
</script>

<style>

</style>