<template lang="html">
  <attribute-dialog
		v-bind="attribute"
		:effects="effects"
		v-on="{clickedEffect, change}"
	/>
</template>

<script>
	import AttributeDialog from '/imports/ui/components/attributes/AttributeDialog.vue';
	import Attributes from '/imports/api/creature/properties/Attributes.js';
	import {
		updateAttribute,
		adjustAttribute
	} from '/imports/api/creature/properties/Attributes.js';
	import Effects from '/imports/api/creature/properties/Effects.js';
	import { setName } from '/imports/api/parenting/parenting.js';

	export default {
		components: {
			AttributeDialog,
		},
		props: {
			_id: String,
		},
		meteor: {
			attribute(){
				return Attributes.findOne(this._id);
			},
			effects(){
				if (!this.attribute) return;
				let charId = this.attribute.charId;
				let stat = this.attribute.variableName;
				return Effects.find({
					charId,
					stat,
					enabled: true,
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
				if (update.name){
					setName.call({})
				} if (update)
				updateAttribute.call({
					_id: this._id,
					update: {$set: update}
				}, error => {
					ack(error);
					if (error) console.error(error);
				});
			},
		}
	};
</script>

<style lang="css" scoped>
</style>
