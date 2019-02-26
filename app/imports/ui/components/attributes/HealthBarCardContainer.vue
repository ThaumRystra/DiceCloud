<template lang="html">
  <health-bar-card
		:attributes="attributes"
		@change="healthBarChanged"
		@click="healthBarClicked"
	/>
</template>

<script>
	import Attributes from '/imports/api/creature/properties/Attributes.js';
	import { adjustAttribute } from '/imports/api/creature/properties/Attributes.js';
	import HealthBarCard from '/imports/ui/components/attributes/HealthBarCard.vue';

	export default {
		components: {
			HealthBarCard,
		},
		props: {
			charId: String,
		},
		meteor: {
			attributes(){
				return Attributes.find({
					charId: this.charId,
					type: 'healthBar',
					value: {$ne: 0},
				}, {
					sort: {order: 1},
				});
			},
		},
		methods: {
			healthBarClicked({_id}){
				this.$store.commit("pushDialogStack", {
					component: "attribute-dialog-container",
					elementId: _id,
					data: {_id},
				});
			},
			healthBarChanged({_id, change}){
				adjustAttribute.call({
					_id,
					[change.type]: change.value
				});
			},
		},
	};
</script>
