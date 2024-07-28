<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-tabs
        v-model="tab"
        :color="$vuetify.theme.themes.dark.accent"
        grow
      >
        <v-tab>User Files</v-tab>
        <v-tab>From URL</v-tab>
      </v-tabs>
    </template>
    <v-tabs-items
      slot="unwrapped-content"
      v-model="tab"
      class="file-input-content fill-height"
    >
      <v-tab-item
        class="fill-height"
        style="overflow: auto;"
      >
        <div
          class="user-image-list pa-4 d-flex flex-wrap"
        >
          <v-img
            v-for="file in userImages"
            :key="file._id"
            :data-id="`image-${file._id}`"
            class="user-image ma-1 v-sheet"
            :class="{'elevation-4': file.href === href}"
            height="250"
            :src="file.href"
            @click="selectUserImage(file.href)"
          >
            <v-btn
              class="zoom-button"
              icon
              @click.stop="previewImage(file._id, file.href)"
            >
              <v-icon>mdi-magnify-plus</v-icon>
            </v-btn>
          </v-img>
          <v-btn
            outlined
            class="upload-image-button ma-1"
            :color="fileUploadError ? 'error' : undefined"
            :disabled="fileUploadInProgress"
            @click="$refs.archiveFileInput.click()"
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
          </v-btn>
          <div style="height: 0;" />
          <div style="height: 0;" />
          <div style="height: 0;" />
        </div>
      </v-tab-item>
      <v-tab-item
        class="fill-height"
      >
        <v-card-text class="fill-height d-flex flex-column justify-center align-center">
          <v-text-field
            v-model="inputHref"
            label="Direct link to image"
            class="flex-grow-0"
            style="width: 100%"
          />
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>
    <v-spacer
      slot="actions"
    />
    <v-btn
      v-if="tab === 1"
      slot="actions" 
      color="accent"
      outlined
      :disabled="!inputHref"
      @click="selectUserImage(inputHref)"
    >
      <v-icon left>
        mdi-check
      </v-icon>
      Save
    </v-btn>
    <v-btn
      v-else
      slot="actions"
      text
      @click="$emit('pop')"
    >
      Close
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';

export default {
  components: {
    DialogBase,
  },
  props: {
    href: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      tab: 0,
      progress: 0,
      inputHref: this.href,
    };
  },
  meteor: {
    userImages() {
      // return UserImages.find({});
      return [
        {
          _id: '1',
          name: 'Example image 1',
          href: 'https://picsum.photos/1000/1000',
        },
        {
          _id: '2',
          name: 'Example image 2',
          href: 'https://picsum.photos/500/600',
        },
        {
          _id: '3',
          name: 'Example image 3',
          href: 'https://picsum.photos/850/700',
        },
      ]
    },
  },
  methods: {
    previewImage(id, href) {
      this.$store.commit('pushDialogStack', {
        component: 'image-preview-dialog',
        elementId: `image-${id}`,
        data: {
          href: href,
        },
      });
    },
    selectUserImage(href) {
      this.$store.dispatch('popDialogStack', href);
    },
  },
};
</script>

<style lang="css" scoped>
.user-image-list > * {
  height: 250px;
  width: 250px;
  flex-basis: 200px;
  flex-grow: 1;
  flex-shrink: 1;
}
.user-image-list > .upload-image-button {
  height: 250px;
}
.user-image {
  cursor: pointer;
}
.user-image.elevation-4 {
  border: 2px solid #f44336;
}
.zoom-button {
  position: absolute;
  cursor: zoom-in;
  bottom: 0;
  right: 0;
}
</style>
