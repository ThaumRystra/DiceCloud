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

export default {
  data(){return {
    progress: 0,
    file: undefined,
    uploadingInProgress: false,
    fileUploadError: undefined,
  }},
  watch: {
    file(file){
      if (!file) return;
      let self = this;
      let uploadInstance = UserImages.insert({
        file: file,
        chunkSize: 'dynamic',
        allowWebWorkers: true,
        meta: {
          createdAt: new Date(),
        },
      }, false)

      self.uploadingInProgress = true;
      self.uploadIndeterminate = true;

      uploadInstance.on('start', function () {
        self.progress = 0;
        self.uploadIndeterminate = false;
      });

      uploadInstance.on('end', function (error, fileObj) {
        self.resetState();
        self.$emit('uploaded', UserImages.link(fileObj));
      });

      uploadInstance.on('uploaded', function (error, fileObj) {
        // Remove the file from the input box
        self.file = undefined;
        self.resetState();
        self.progress = 0;
      });

      uploadInstance.on('error', function (error, fileObj) {
        // Remove the file from the input box
        self.file = undefined;
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
      this.file = undefined;
      this.uploadingInProgress = false;
      this.progress = 0;
      this.fileUploadError = undefined;
    },
  },

}
</script>

<style>

</style>