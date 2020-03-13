<template lang="html">
	<div>
		<markdown-text v-if="value" :markdown="value"/>
	</div>
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
