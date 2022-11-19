<template>
  <div class="file-upload-input">
    <v-file-input
      v-model="file"
      v-bind="$attrs"
      accept="image/*"
    />
    <v-progress-linear
      :progress="progress"
    />
  </div>
</template>

<script lang="js">
import UserImages from '/imports/api/files/UserImages.js';

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
          /*meta: {
            userId: Meteor.userId() // Optional, used to check on server for file tampering
          },*/
          chunkSize: 'dynamic',
          allowWebWorkers: true // If you see issues with uploads, change this to false
        }, false)

        // These are the event functions, don't need most of them, it shows where we are in the process
        uploadInstance.on('start', function () {
          console.log('Starting');
          this.uploadingInProgress = true;
        });

        uploadInstance.on('end', function (error, fileObj) {
          console.log('On end File Object: ', fileObj);
          this.uploadingInProgress = false;
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
          console.log('Error during upload: ' + error, fileObj)
        });

        uploadInstance.on('progress', function (progress, fileObj) {
          console.log('Upload Percentage: ' + progress, fileObj)
          // Update our progress bar
          self.progress = progress;
        });

        uploadInstance.start(); // Must manually start the upload
      }
  },

}
</script>

<style>

</style>