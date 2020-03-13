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
				//TODO sanitizing by marked is deprecated
				//TODO Markdown <hr> need to be styled to match their vue components
				return marked(this.markdown, { sanitize: true });
	    },
	  },
	}
</script>
