<template>
  <outlined-input
    :name="label"
    class="mb-6 pt-1"
  >
    <v-file-input
      v-cloak
      ref="input"
      v-bind="$attrs"
      v-model="file"
      class="dc-file-field"
      :loading="loading"
      :error-messages="errors"
      :disabled="isDisabled"
      :outlined="!regular"
      @drop.prevent="addDropFile"
      @dragover.prevent
      @focus="focused = true"
      @blur="focused = false"
      @keyup="e => $emit('keyup', e)"
    />
  </outlined-input>
</template>

<script lang="js">
/*
  States to handle:
  - Empty
  - Image from URL
  - Image from file
  - Image from file being uploaded
  - Upload fail
  - File invalid as image (size, extension)
  Actions to handle
  - Changing an image
    - Do we delete the old one, or leave it in the user's account?
  - Select image from user's files
  - URL image

  TODO
  Clicking opens image input dialog
  Drag-drop opens image input dialog with a file ready to upload
*/
import UserImages from '/imports/api/files/userImages/UserImages';
import SmartInput from '/imports/client/ui/components/global/SmartInputMixin';

export default {
  mixins: [SmartInput],
  data() {
    return {
      url: '',
    };
  },
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
  methods: {
    handleUrlChange() {
      this.$emit('change', this.url);
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      this.uploadFile(file);
    },
    handleDragOver(event) {
      // TODO
    },
    handleDrop(event) {
      // TODO
      const file = event.dataTransfer.files[0];
      this.uploadFile(file);
    },
    uploadFile(file) {
      // Implement your file upload logic here
    },
  },
};
</script>