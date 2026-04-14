<script setup lang="ts">
import { ref, watch } from 'vue';
import { autorun, subscribe } from 'vue-meteor-tracker';
import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles';
import UserImages from '/imports/api/files/userImages/UserImages';
import prettyBytes from 'pretty-bytes';
import ArchiveFileCard from '/imports/client/ui/files/ArchiveFileCard.vue';
import FileStorageStats from '/imports/client/ui/files/FileStorageStats.vue';
import ImageUploadInput from '/imports/client/ui/components/ImageUploadInput.vue';
import UserImageCard from '/imports/client/ui/files/userImages/UserImageCard.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { archiveSchema } from '/imports/api/creature/archive/ArchiveCreatureFiles';
import migrateArchive from '/imports/migrations/archive/migrateArchive';

subscribe('archiveCreatureFiles');
subscribe('userImages');
subscribe('characterList');

const archiveFileInput = ref<HTMLInputElement | null>(null);
const archiveFileError = ref<string | undefined>(undefined);
const archiveFile = ref<File | undefined>(undefined);
const archiveUploadInProgress = ref(false);
const archiveUploadProgress = ref(0);
const archiveUploadIndeterminate = ref(true);

watch(archiveUploadInProgress, (val) => {
  if (val === false) {
    archiveUploadProgress.value = 0;
    archiveUploadIndeterminate.value = true;
  }
});

const { result: archiveFiles } = autorun(() => {
  const userId = Meteor.userId();
  return ArchiveCreatureFiles.find(
    { userId },
    { sort: { size: -1 } }
  ).map((f: any) => {
    f.size = prettyBytes(f.size);
    f.link = ArchiveCreatureFiles.link(f);
    return f;
  });
});

const { result: imageFiles } = autorun(() => {
  const userId = Meteor.userId();
  return UserImages.find(
    { userId },
    {
      sort: {
        'meta.createdAt': -1,
        name: 1,
        size: -1,
      },
    }
  ).map((f: any) => {
    f.size = prettyBytes(f.size);
    f.link = UserImages.link(f);
    return f;
  });
});

function inputArchiveFile() {
  archiveFile.value = undefined;
  archiveFileError.value = undefined;
  const file = archiveFileInput.value?.files?.[0];
  // Reset the file input
  if (archiveFileInput.value) archiveFileInput.value.value = '';
  if (!file) return;
  if (file.type !== 'application/json') {
    archiveFileError.value = 'File must be .json';
    return;
  }
  if (file.size > 10000000) {
    archiveFileError.value = 'File too large';
    return;
  }
  archiveFile.value = file;
  archiveUploadIndeterminate.value = true;
  archiveUploadInProgress.value = true;
  archiveUploadProgress.value = 0;

  const fr = new FileReader();

  fr.addEventListener('load', () => {
    let data: any;
    try {
      data = JSON.parse(fr.result as string);
    } catch (e) {
      archiveFileError.value = 'File could not be parsed';
      archiveUploadInProgress.value = false;
      console.error(e);
      return;
    }
    try {
      migrateArchive(data);
      data = archiveSchema.clean(data);
      archiveSchema.validate(data);
    } catch (e: any) {
      archiveFileError.value = 'File failed validation: ' + (e.reason || e.message || e.toString());
      archiveUploadInProgress.value = false;
      console.error(e);
      return;
    }

    const uploadInstance = ArchiveCreatureFiles.insert({
      file,
      meta: {
        creatureName: data?.creature?.name,
        userId: Meteor.userId(),
      },
      chunkSize: 'dynamic',
      allowWebWorkers: true,
    }, false);

    uploadInstance.on('start', function () {
      archiveUploadIndeterminate.value = false;
    });

    uploadInstance.on('end', function () {
      archiveUploadInProgress.value = false;
    });

    uploadInstance.on('uploaded', function () {
      archiveFile.value = undefined;
      archiveUploadInProgress.value = false;
    });

    uploadInstance.on('error', function (error: any) {
      const text = error.reason || error.message || error;
      snackbar({ text });
      archiveFileError.value = text;
      archiveUploadInProgress.value = false;
    });

    uploadInstance.on('progress', function (progress: number) {
      archiveUploadProgress.value = progress;
    });

    uploadInstance.start();
  });

  fr.readAsText(file);
}
</script>

<template>
  <v-container>
    <v-row
      justify="center"
      class="mt-2"
    >
      <file-storage-stats />
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-list-subheader> Archived Characters </v-list-subheader>
      </v-col>
      
      <v-col
        key="upload"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
        class="d-flex flex-column justify-center"
      >
        <input
          ref="archiveFileInput"
          type="file"
          accept=".json"
          style="display: none;"
          @input="inputArchiveFile"
        >
        <v-btn
          variant="outlined"
          style="height: 100%; width: 100%; min-height: 120px;"
          class="archive-button"
          :color="archiveFileError ? 'error' : undefined"
          :disabled="archiveUploadInProgress"
          prepend-icon="mdi-file-upload-outline"
          @click="archiveFileInput?.click()"
        >
          <template v-if="archiveFileError">
            {{ archiveFileError }}
          </template>
          <template v-else>
            Upload archive
          </template>
          <v-progress-linear
            v-if="archiveUploadInProgress"
            :model-value="archiveUploadProgress"
            :indeterminate="archiveUploadIndeterminate"
          />
        </v-btn>
      </v-col>
      <template v-if="archiveFiles && archiveFiles.length">
        <v-col
          v-for="file in archiveFiles"
          :key="file._id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <archive-file-card :model="file" />
        </v-col>
      </template>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <v-list-subheader> Images </v-list-subheader>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
      >
        <image-upload-input
          style="height: 100%; width: 100%; min-height: 120px;"
        />
      </v-col>
      <template v-if="imageFiles && imageFiles.length">
        <v-col
          v-for="file in imageFiles"
          :key="file._id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <user-image-card :model="file" />
        </v-col>
      </template>
    </v-row>
    <!--
    <v-row dense>
      <v-col cols="12">
        <v-list-subheader> Images </v-list-subheader>
      </v-col>
      <template v-if="userImages && userImages.length">
        <v-col
          v-for="file in userImages"
          :key="file._id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <user-image-card :model="file" />
        </v-col>
      </template>
      <v-col
        key="image-upload"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
        class="d-flex flex-column justify-center"
      >
        <image-upload-input />
      </v-col>
    </v-row>
    -->
  </v-container>
</template>

<style>
  .v-btn.archive-button > .v-btn__content {
    white-space: normal;
    max-width: 100%;
  }
</style>
