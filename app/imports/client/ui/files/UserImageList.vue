<template>
  <v-row
    dense 
    @drop.prevent="addDropFile"
    @dragover.prevent="imageDragOver"
  >
    <v-col cols="12">
      <v-subheader> Images </v-subheader>
    </v-col>
    <template v-if="userImages && userImages.length">
      <v-col
        v-for="userImage in userImages"
        :key="userImage._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
      >
        <user-image-card :model="userImage" />
      </v-col>
    </template>
    <v-col
      key="upload"
      cols="12"
      sm="6"
      md="4"
      lg="3"
      xl="2"
      class="layout column justify-center"
    >
      <input
        ref="uploadImageInput"
        type="file"
        accept=".json"
        style="display: none;"
        @input="uploadImageFile"
      >
      <v-btn
        outlined
        style="height: 100%; width: 100%; min-height: 120px;"
        class="archive-button"
        :color="uploadImageError ? 'error' : undefined"
        :disabled="uploadImageInProgress"
        @click="$refs.uploadImageInput.click()"
      >
        <v-icon left>
          mdi-file-upload-outline
        </v-icon>
        <template v-if="uploadImageError">
          {{ uploadImageError }}
        </template>
        <template v-else>
          Upload archive
        </template>
        <v-progress-linear
          v-if="uploadImageInProgress"
          :value="imageUploadProgress"
          :indeterminate="imageUploadIndeterminate"
        />
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="js">
import prettyBytes from 'pretty-bytes';
import UserImages from '/imports/api/files/userImages/UserImages';
import UserImageCard from '/imports/client/ui/files/UserImageCard.vue';

export default {
  components: {
    UserImageCard,
  },
  meteor: {
    $subscribe: {
      'userImages': [],
    },
    userImages() {
      const userId = Meteor.userId();
      return UserImages.find({
        userId
      }, {
        sort: {
          size: -1
        },
      }).map(f => {
        f.size = prettyBytes(f.size);
        f.link = UserImages.link(f);
        return f;
      });
    }
  }
}
</script>
