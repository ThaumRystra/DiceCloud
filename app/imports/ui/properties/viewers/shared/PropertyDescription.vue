<template lang="html">
	<p v-if="value" class="mt-3">
		<markdown-text :markdown="value"/>
	</p>
</template>

<script>
import MarkdownText from '/imports/ui/components/MarkdownText.vue';

export default {
	props: {
		value: String,
	},
	components: {
		MarkdownText,
	},
}
</script>
