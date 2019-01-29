<template lang="html">
  <ability-dialog
		v-bind="ability"
		v-on="{clickedEffect}"
	/>
</template>

<script>
	import AbilityDialog from '/imports/ui/components/AbilityDialog.vue';
	import Attributes from '/imports/api/creature/properties/Attributes.js';
	export default {
		components: {
			AbilityDialog,
		},
		props: {
			_id: String,
		},
		meteor: {
			ability(){
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
