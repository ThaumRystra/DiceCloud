<template>
  <outlined-input
    :name="label"
    class="smart-image-input mb-3"
    :data-id="id"
    :class="{ dragging }"
    @click="openImageInputDialog"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <template v-if="value">
      <img
        v-if="value"
        class="image"
        :src="value"
      >
      <div
        class="image-overlay"
        :class="themeClasses"
      />
      <v-btn
        v-if="value"
        icon
        dark
        class="clear-button ma-1"
        @click.stop="change(undefined)"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
    <div
      v-else
      class="add-image-text d-flex align-center justify-center"
    >
      Add image
      <v-icon
        right
      >
        mdi-image-outline
      </v-icon>
    </div>
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
  inject: {
    theme: {
      default: {
        isDark: false,
      },
    },
  },
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
  computed: {
    themeClasses() {
      return {
        'theme--dark': this.theme.isDark,
        'theme--light': !this.theme.isDark,
      }
    },
  },
  methods: {
    openImageInputDialog() {
      this.$store.commit('pushDialogStack', {
        component: 'image-input-dialog',
        elementId: this.id,
        data: {
          href: this.value,
        },
        callback: (href) => {
          if (href) {
            this.change(href);
          }
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
      // TODO
      // event.preventDefault();
      // this.dragging = true;
    },
    handleDragLeave() {
      // TODO
      // this.dragging = false;
    },
    handleDrop(event) {
      // TODO
      // console.log(event);
      // event.preventDefault();
      // const file = event.dataTransfer.files[0];
      // this.dragging = false;
      // this.uploadFile(file);
    },
    uploadFile(file) {
      // Implement your file upload logic here
    },
  },
};
</script>

<style scoped>
.smart-image-input {
  position: relative;
  min-height: 120px;
  cursor: pointer;
  overflow: hidden;
}
.image {
  min-height: 100px;
  max-height: 300px;
  max-width: 100%;
  margin-bottom: -7px;
}
.clear-button {
  position: absolute;
  top: 0;
  right: 0;
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
.image-overlay {
  position: absolute;
  top: 0;
  height: 12px;
  left: 0;
  right: 0;
}
.image-overlay.theme--dark {
  background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
}
.image-overlay.theme--light {
  background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
}
.add-image-text {
  opacity: 0.7;
  height: 118px; 
}
.smart-image-input:hover .add-image-text {
  opacity: 1;
}
</style>

<style>
.smart-image-input > legend {
  position: relative;
  z-index: 1;
}
.smart-image-input .clear-button i {
  text-shadow: 0 0 4px #000, 0 0 4px #000 ;
}
</style>