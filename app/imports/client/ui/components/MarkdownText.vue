<template lang="html">
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="markdown"
    @click="e => $emit('click', e)"
    v-html="compiledMarkdown"
  />
</template>

<script lang="js">
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default {
  props: {
    markdown: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    compiledMarkdown() {
      if (!this.markdown) return;
      return DOMPurify.sanitize(marked(this.markdown));
    },
  },
}
</script>
