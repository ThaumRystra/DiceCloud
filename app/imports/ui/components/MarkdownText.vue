<template lang="html">
  <div v-html="compiledMarkdown">
	</div>
</template>

<script>
	import marked from 'marked';

	export default {
		props: {
			markdown: String,
		},
		computed: {
	    compiledMarkdown() {
				if (!this.markdown) return;
				return marked(this.markdown, { sanitize: true });
	    },
	  },
	}
</script>
