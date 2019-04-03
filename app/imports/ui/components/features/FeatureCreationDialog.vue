<template lang="html">
	<property-insert-dialog
		documentType="Feature"
		:doc="feature"
		:schema="schema"
		:errors.sync="errors"
	>
		<feature-form
			:feature="feature"
			@update="update"
			:debounce-time="0"
			:errors="errors"
		/>
	</property-insert-dialog>
</template>

<script>
	import FeatureForm from '/imports/ui/components/features/FeatureForm.vue';
	import Features, { FeatureSchema } from '/imports/api/creature/properties/Features.js';
	import PropertyInsertDialog from '/imports/ui/components/properties/PropertyInsertDialog.vue';

	export default {
		components: {
			FeatureForm,
			PropertyInsertDialog,
		},
		data(){ return {
			feature: {
				name: 'New Feature',
				description: null,
				enabled: true,
				alwaysEnabled: true,
				color: '#9E9E9E',
			},
			schema: FeatureSchema,
			errors: {},
		}},
		methods: {
			update(update, ack){
				for (key in update){
					this.feature[key] = update[key];
				}
				ack();
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
