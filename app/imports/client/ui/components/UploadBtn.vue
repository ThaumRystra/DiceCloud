<template>
  <v-btn v-bind="$attrs" @click="triggerUpload">
    {{ title }}
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      style="display: none;"
      @change="onFileChange"
    >
  </v-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{
  title?: string;
  accept?: string;
}>(), {
  title: 'Upload',
  accept: '*',
});

const emit = defineEmits<{
  'file-update': [file: File];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

function triggerUpload() {
  fileInput.value?.click();
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    emit('file-update', file);
  }
  input.value = '';
}
</script>
