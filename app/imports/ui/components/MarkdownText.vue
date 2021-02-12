<template lang="html">
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="compiledMarkdown" />
</template>

<script>
	import marked from 'marked';

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
