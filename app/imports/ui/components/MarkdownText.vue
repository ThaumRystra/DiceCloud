<template lang="html">
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    class="markdown"
    v-html="compiledMarkdown"
  />
</template>

<script lang="js">
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

<style lang="css">
  .markdown img {
    max-width: 100%;
    margin: 8px 0;
  }
</style>
