<template lang="html">
		<div>
			<markdown-text :markdown="feature.computedDescription || feature.description"/>
			<!--
			<child-lists
				:parent="feature"
			/>
			-->
			<feature-form slot="form" :feature="feature" @update="(update, ack) => $emit('update', update, ack)"/>
		</div>
</template>

<script>
	import FeatureForm from '/imports/ui/properties/forms/FeatureForm.vue';
	import MarkdownText from '/imports/ui/components/MarkdownText.vue';

	export default {
		components: {
			FeatureForm,
			MarkdownText,
		},
		props: {
			feature: Object,
		},
	}
</script>

<style lang="css" scoped>
</style>
