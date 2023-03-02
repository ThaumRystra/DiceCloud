<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="markdown"
    @click="e => $emit('click', e)"
    v-html="compiledMarkdown"
  />
</template>

<script>
import { marked } from 'marked';

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
      return marked(this.markdown);
    },
  },
}
</script>
