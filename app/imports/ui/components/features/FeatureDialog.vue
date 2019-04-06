<template lang="html">
	<property-dialog :doc="feature" collection="features" @remove="$emit('remove')">
		<div>
			<markdown-text :markdown="feature.computedDescription || feature.description"/>
			<!--
			<child-lists
				:parent="feature"
			/>
			-->
		</div>
		<feature-form slot="form" :feature="feature" @update="(update, ack) => $emit('update', update, ack)"/>
	</property-dialog>
</template>

<script>
	import PropertyDialog from '/imports/ui/components/properties/PropertyDialog.vue';
	import FeatureForm from '/imports/ui/components/features/FeatureForm.vue';
	import MarkdownText from '/imports/ui/components/MarkdownText.vue';

	export default {
		components: {
			PropertyDialog,
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
