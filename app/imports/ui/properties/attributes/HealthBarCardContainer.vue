<template lang="html">
  <health-bar-card
		:attributes="attributes"
		@change="healthBarChanged"
		@click="healthBarClicked"
	/>
</template>

<script>
	import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
	import HealthBarCard from '/imports/ui/properties/attributes/HealthBarCard.vue';

	export default {
		components: {
			HealthBarCard,
		},
		props: {
			charId: String,
		},
		meteor: {
			attributes(){
				return CreatureProperties.find({
					'ancestor.id': this.charId,
					type: 'attribute',
					attributeType: 'healthBar',
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
