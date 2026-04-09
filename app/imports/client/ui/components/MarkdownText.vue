<template lang="html">
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="markdown"
    @click="e => $emit('click', e)"
    v-html="compiledMarkdown"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps<{
  markdown?: string;
}>();

const emit = defineEmits<{
  click: [e: MouseEvent];
}>();

const compiledMarkdown = computed(() => {
  if (!props.markdown) return;
  return DOMPurify.sanitize(marked(props.markdown) as string);
});
</script>
