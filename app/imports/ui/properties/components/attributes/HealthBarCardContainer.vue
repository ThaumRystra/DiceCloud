<template lang="html">
  <health-bar-card
    :attributes="attributes"
    @change="healthBarChanged"
    @click="healthBarClicked"
  />
</template>

<script>
	import CreatureProperties, { damageProperty } from '/imports/api/creature/CreatureProperties.js';
	import HealthBarCard from '/imports/ui/properties/components/attributes/HealthBarCard.vue';

	export default {
		components: {
			HealthBarCard,
		},
		props: {
			creatureId: String,
		},
		meteor: {
			attributes(){
				return CreatureProperties.find({
					'ancestors.id': this.creatureId,
					type: 'attribute',
					attributeType: 'healthBar',
				}, {
					sort: {order: 1},
				});
			},
		},
		methods: {
			healthBarClicked({_id}){
				this.$store.commit('pushDialogStack', {
					component: 'creature-property-dialog',
					elementId: `${_id}`,
					data: {_id},
				});
			},
			healthBarChanged({_id, change}){
				damageProperty.call({
					_id,
					operation: change.type,
					value: change.value
				});
			},
		},
	};
</script>
