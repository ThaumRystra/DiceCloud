<template>
  <v-card
    class="user-image-card d-flex flex-column"
    @click="previewImage"
  >
    <v-img
      :lazy-src="thumbHashDataUrl"
      :src="model.link"
      :data-id="`${model._id}-image`"
    />
    <v-flex />
    <v-card-title class="no-wrap">
      {{ model.name }}
    </v-card-title>
    <v-card-subtitle class="no-wrap">
      {{ model.size }}
    </v-card-subtitle>
    <v-card-actions>
      <v-flex />
      <v-menu left>
        <template #activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="removeUserFile">
            <v-list-item-title>
              Delete file
              <v-icon right>
                mdi-delete
              </v-icon>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        icon
        :href="`${model.link}?download=true`"
        @click.stop
      >
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="js">
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import removeUserImage from '/imports/api/files/userImages/methods/removeUserImage';
import { thumbHashToDataURL } from 'thumbhash';

export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      removeLoading: false,
    }
  },
  computed: {
    thumbHashDataUrl() {
      const thumbHash = this.model.meta?.thumbHash;
      if (!thumbHash) return;
      return thumbHashToDataURL(thumbHash);
    }
  },
  methods: {
    removeUserFile() {
      this.removeLoading = true;
      removeUserImage.call({ fileId: this.model._id }, (error) => {
        this.removeLoading = false;
        if (error) {
          snackbar({text: error.reason || error.message || error.toString()})
          console.error(error);
        }
      });
    },
    previewImage() {
      this.$store.commit('pushDialogStack', {
        component: 'image-preview-dialog',
        elementId: `${this.model._id}-image`,
        data: {
          href: this.model.link,
        },
      });
    },
  },
}
</script>

<style scoped>
  .no-wrap {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-image-card {
    height: 100%;
  }
</style>
