<template>
  <outlined-input
    :name="label"
    class="smart-image-input mb-3 pt-4"
    :data-id="id"
    :class="{ dragging }"
    @click="openImageInputDialog"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <img
      v-if="value"
      class="image"
      :src="value"
    >
  </outlined-input>
</template>

<script lang="js">
/*
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
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';

export default {
  components: {
    OutlinedInput,
  },
  mixins: [SmartInput],
  props: {
    label: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      id: Random.id(),
      dragging: false,
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
    openImageInputDialog() {
      this.$store.commit('pushDialogStack', {
        component: 'image-input-dialog',
        elementId: this.id,
        data: {
          href: this.value,
        },
      });
    },
    handleUrlChange() {
      this.$emit('change', this.url);
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      this.uploadFile(file);
    },
    handleDragOver(event) {
      event.preventDefault();
      this.dragging = true;
    },
    handleDragLeave() {
      this.dragging = false;
    },
    handleDrop(event) {
      console.log(event);
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      this.dragging = false;
      this.uploadFile(file);
    },
    uploadFile(file) {
      // Implement your file upload logic here
    },
  },
};
</script>

<style scoped>
.smart-image-input {
  min-height: 120px;
  cursor: pointer;
}
.image {
  max-height: 400px;
  max-width: 100%;
}
.dragging {
  border-style: dashed;
}
.outlined-input.dragging.theme--dark:not(.no-hover) {
  border-color: #fff;
}
.outlined-input.dragging.theme--light:not(.no-hover) {
  border-color: rgba(0,0,0,.86);
}
</style>