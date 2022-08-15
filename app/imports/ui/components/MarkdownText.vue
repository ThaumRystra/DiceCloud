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
