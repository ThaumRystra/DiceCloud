<template lang="html">
  <feature-dialog
		:feature="feature"
		@update="update"
		@remove="remove"
	/>
</template>

<script>
	import Features, {updateFeature} from '/imports/api/creature/properties/Features.js';
	import FeatureDialog from '/imports/ui/creature/properties/features/FeatureDialog.vue';
	import {evaluateStringForCharId} from '/imports/ui/utility/evaluate.js';

	export default {
		components: {
			FeatureDialog,
		},
		props: {
			_id: String,
		},
		meteor: {
			feature(){
				let feature = Features.findOne(this._id);
				feature.computedDescription = evaluateStringForCharId(
					feature.description, feature.charId
				);
				return feature;
			},
		},
		methods: {
			update(update, ack){
				updateFeature.call({
					_id: this._id,
					update,
				}, error => ack(error));
			},
			remove(){
				softRemoveProperty({_id: this._id, collection: 'features'});
			}
		},
	};
</script>
