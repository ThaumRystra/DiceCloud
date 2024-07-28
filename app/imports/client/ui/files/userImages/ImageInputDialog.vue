<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-tabs
        v-model="tab"
        grow
      >
        <v-tab>User Files</v-tab>
        <v-tab>From URL</v-tab>
      </v-tabs>
    </template>
    <v-tabs-items
      slot="unwrapped-content"
      v-model="tab"
      class="fill-height"
    >
      <v-tab-item
        class="fill-height"
        style="overflow: auto;"
      >
        <v-card-text
          class="user-image-list d-flex flex-wrap"
        >
          <image-field
            v-for="file in userImages"
            :key="file._id"
            class="image-field"
            :name="file.name"
            :href="file.href"
            :aspect-ratio="0.2"
          />
          <image-field
            name="Example image 3"
            href="https://picsum.photos/1000/1000"
          />
          <image-field
            name="Example image 2"
            href="https://picsum.photos/500/600"
          />
          <image-field
            name="Example image 3"
            href="https://picsum.photos/850/700"
          />
          <v-col
            class="mb-3"
            v-bind="{cols: 12, sm: 6, md: 4}"
          >
            <v-btn
              outlined
              style="height: 100%; width: 100%; min-height: 120px;"
              class="archive-button"
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
          </v-col>
        </v-card-text>
      </v-tab-item>
      <v-tab-item
        class="fill-height"
      >
        <v-card-text class="fill-height d-flex align-center">
          <text-field
            label="Direct link to image"
            :value="href"
          />
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      @click="$store.dispatch('popDialogStack')"
    >
      Done
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import UserImages from '/imports/api/files/userImages/UserImages';
import ImageField from '/imports/client/ui/properties/viewers/shared/ImageField.vue';

export default {
  components: {
    DialogBase,
    ImageField,
  },
  props: {
    currentHref: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      tab: 0,
      progress: 0,
      href: this.currentHref,
    };
  },
  meteor: {
    userImages() {
      return UserImages.find({});
    },
  },
};
</script>

<style lang="css" scoped>
.user-image-list {
  
}

.image-field > fieldset {
  
}
</style>
