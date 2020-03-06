<template lang="html">
		<feature-form
			:feature="feature"
			@update="update"
			:debounce-time="0"
			:errors="errors"
		/>
</template>

<script>
	import FeatureForm from '/imports/ui/properties/forms/FeatureForm.vue';
	import Features, { FeatureSchema } from '/imports/api/properties/Features.js';

	export default {
		components: {
			FeatureForm,
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
