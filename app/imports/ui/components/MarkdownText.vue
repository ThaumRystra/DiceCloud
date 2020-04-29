<template lang="html">
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="compiledMarkdown" />
</template>

<script>
	import marked from 'marked';
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
				//TODO Markdown <hr> need to be styled to match their vue components
        let html = marked(this.markdown);
        let cleanHtml = DOMPurify.sanitize(html);
				return cleanHtml;
      },
    },
	}
</script>
