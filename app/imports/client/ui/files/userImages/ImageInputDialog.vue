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
          <image-upload-input
            class="ma-1"
            style="height: 250px;"
            @uploaded="link => selectUserImage(link)"
          />
          <v-img
            v-for="file in userImages"
            :key="file._id"
            :data-id="file._id"
            class="user-image ma-1 v-sheet"
            :class="{'elevation-4': file.link === href}"
            height="250"
            :src="file.link"
            :lazy-src="file.thumbHashDataUrl"
            @click="selectUserImage(file.link)"
          >
            <v-btn
              class="zoom-button"
              icon
              @click.stop="previewImage(file)"
            >
              <v-icon>mdi-magnify-plus</v-icon>
            </v-btn>
          </v-img>
          <div
            style="height: 0;"
            class="ma-1"
          />
          <div
            style="height: 0;"
            class="ma-1"
          />
          <div
            style="height: 0;"
            class="ma-1"
          />
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
import UserImages from '/imports/api/files/userImages/UserImages';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import ImageUploadInput from '/imports/client/ui/components/ImageUploadInput.vue';
import prettyBytes from 'pretty-bytes';
import { thumbHashToDataURL } from 'thumbhash';

export default {
  components: {
    DialogBase,
    ImageUploadInput,
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
    $subscribe: {
      'userImages': [],
    },
    userImages() {
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
        if (f.meta?.thumbHash) {
          f.thumbHashDataUrl = thumbHashToDataURL(f.meta.thumbHash);
        }
        return f;
      });
    },
  },
  methods: {
    previewImage(file) {
      this.$store.commit('pushDialogStack', {
        component: 'image-preview-dialog',
        elementId: file._id,
        data: {
          href: file.link,
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
