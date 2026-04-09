<template>
  <div
    v-bind="$attrs"
    class="d-flex flex-column "
  >
    <v-btn
      variant="outlined"
      block
      class="image-upload-button flex-grow-1"
      v-bind="$attrs"
      style="min-height: 64px;"
      :loading="uploadingInProgress"
      @click="$refs.hiddenFileInput.click()"
      prepend-icon="mdi-file-upload-outline"
    >
      <div>
        Upload Image
      </div>
      <template #loader>
        <v-progress-circular
          :value="progress"
          :indeterminate="uploadIndeterminate"
        />
      </template>
      <input
        ref="hiddenFileInput"
        type="file"
        accept="image/*"
        style="display: none;"
        @input="inputChange"
      >
    </v-btn>
    <v-alert
      v-if="fileUploadError"
      variant="outlined"
      type="error"
      class="mb-0 mt-4"
    >
      {{ fileUploadError }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import UserImages from '/imports/api/files/userImages/UserImages';
import getThumbHash from '/imports/client/ui/utility/getThumbHash.js';

const emit = defineEmits(['uploaded']);

const progress = ref(0);
const file = ref<File | undefined>(undefined);
const uploadingInProgress = ref(false);
const uploadIndeterminate = ref(false);
const fileUploadError = ref<string | undefined>(undefined);
const hiddenFileInput = ref<HTMLInputElement | null>(null);

watch(file, async (newFile) => {
  if (!newFile) return;
  uploadingInProgress.value = true;
  uploadIndeterminate.value = true;

  let thumbHash: any = undefined;
  try {
    thumbHash = await getThumbHash(newFile);
  } catch (e) {
    console.error('Failed to generate thumbHash');
    console.error(e);
  }

  const uploadInstance = UserImages.insert({
    file: newFile,
    chunkSize: 'dynamic',
    allowWebWorkers: true,
    meta: {
      createdAt: new Date(),
      thumbHash,
    },
  }, false);

  uploadInstance.on('start', function () {
    progress.value = 0;
    uploadIndeterminate.value = false;
    fileUploadError.value = undefined;
  });

  uploadInstance.on('end', function (error: any, fileObj: any) {
    resetState();
    emit('uploaded', UserImages.link(fileObj));
  });

  uploadInstance.on('uploaded', function () {
    progress.value = 0;
  });

  uploadInstance.on('error', function (error: any) {
    fileUploadError.value = error.reason || error.message || error.toString();
  });

  uploadInstance.on('progress', function (p: number) {
    uploadIndeterminate.value = false;
    progress.value = p;
  });

  try {
    uploadInstance.start();
  } catch (error: any) {
    fileUploadError.value = error.reason || error.message || error.toString();
    resetState();
  }
});

function inputChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input) return;
  const { files: selectedFiles } = input;
  if (!selectedFiles) return;
  file.value = selectedFiles[0];
}

function resetState() {
  file.value = undefined;
  if (hiddenFileInput.value) hiddenFileInput.value.value = '';
  uploadingInProgress.value = false;
  progress.value = 0;
}
</script>

<style>

</style>
