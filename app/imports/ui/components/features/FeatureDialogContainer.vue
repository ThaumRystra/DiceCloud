<template lang="html">
  <feature-dialog
		:feature="feature"
		@update="update"
		@remove="remove"
	/>
</template>

<script>
	import Features, {updateFeature} from '/imports/api/creature/properties/Features.js';
	import FeatureDialog from '/imports/ui/components/features/FeatureDialog.vue';

	export default {
		components: {
			FeatureDialog,
		},
		props: {
			_id: String,
		},
		meteor: {
			feature(){
				return Features.findOne(this._id);
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
