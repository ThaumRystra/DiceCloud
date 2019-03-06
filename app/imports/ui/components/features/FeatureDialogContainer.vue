<template lang="html">
  <feature-dialog
		v-bind="feature"
		:effects="effects"
		v-on="{clickedEffect, change}"
	/>
</template>

<script>
	import FeatureDialog from '/imports/ui/components/features/FeatureDialog.vue';
	import Features from '/imports/api/creature/properties/Features.js';
	import { updateFeature } from '/imports/api/creature/properties/Features.js';
	import Effects from '/imports/api/creature/properties/Effects.js';

	export default {
		components: {
			AttributeDialog,
		},
		props: {
			_id: String,
		},
		meteor: {
			feature(){
				return Features.findOne(this._id);
			},
			effects(){
				if (!this.feature) return;
				return Effects.find({
					'parent.id': this.feature._id,
				}, {
					sort: {order: 1},
				}).fetch();
			},
		},
		methods: {
			clickedEffect(e){
				console.log({TODO: e});
			},
			change(update, ack){
				updateFeature.call({_id: this._id, update}, error => ack(error));
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
