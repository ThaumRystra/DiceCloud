<template lang="html">
  <attribute-dialog
		v-bind="attribute"
		v-on="{clickedEffect}"
	/>
</template>

<script>
	import AttributeDialog from '/imports/ui/components/AttributeDialog.vue';
	import Attributes from '/imports/api/creature/properties/Attributes.js';
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
		},
		methods: {
			clickedEffect(e){
				console.log(e);
			}
		}
	};
</script>

<style lang="css" scoped>
</style>
