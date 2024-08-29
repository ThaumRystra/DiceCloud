<template>
  <v-btn
    outlined
    class="image-upload-button ma-1"
    v-bind="$attrs"
    :color="fileUploadError ? 'error' : undefined"
    :disabled="fileUploadInProgress"
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
      v-if="fileUploadInProgress"
      :value="fileUploadProgress"
      :indeterminate="fileUploadIndeterminate"
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
  }},
  watch: {
    file(file){
      if (!file) return;
      let self = this;
      let uploadInstance = UserImages.insert({
        file: file,
        chunkSize: 'dynamic',
        allowWebWorkers: true
      }, false)

      uploadInstance.on('start', function () {
        console.log('Starting');
        this.uploadingInProgress = true;
      });

      uploadInstance.on('end', function (error, fileObj) {
        console.log('On end File Object: ', fileObj);
        this.uploadingInProgress = false;
        self.$emit('uploaded', UserImages.link(fileObj));
      });

      uploadInstance.on('uploaded', function (error, fileObj) {
        console.log('uploaded: ', fileObj);

        // Remove the file from the input box
        self.file = undefined;

        // Reset our state for the next file
        self.uploadingInProgress = false;
        self.progress = 0;
      });

      uploadInstance.on('error', function (error, fileObj) {
        // Remove the file from the input box
        self.file = undefined;

        // Reset our state for the next file
        self.uploadingInProgress = false;
        self.progress = 0;
        console.log('Error during upload: ' + error, fileObj)
      });

      uploadInstance.on('progress', function (progress, fileObj) {
        console.log('Upload Percentage: ' + progress, fileObj)
        // Update our progress bar
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
    }
  },

}
</script>

<style>

</style>