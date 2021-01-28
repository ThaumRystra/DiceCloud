<template lang="html">
  <health-bar-card
    :attributes="attributes"
    @change="healthBarChanged"
    @click="healthBarClicked"
  />
</template>

<script>
  import Creatures from '/imports/api/creature/Creatures.js';
	import { damageProperty } from '/imports/api/creature/CreatureProperties.js';
	import HealthBarCard from '/imports/ui/properties/components/attributes/HealthBarCard.vue';
  import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

	export default {
		components: {
			HealthBarCard,
		},
		props: {
			creatureId: {
        type: String,
        required: true
      },
		},
		meteor: {
      creature(){
        return Creatures.findOne(this.creatureId, {fields: {settings: 1}});
      },
			attributes(){
        let creature = this.creature;
        if (!creature) return;
        let filter = {
          'ancestors.id': creature._id,
          type: 'attribute',
					attributeType: 'healthBar',
          removed: {$ne: true},
          inactive: {$ne: true},
        };
        if (creature.settings.hideUnusedStats){
          filter.hide = {$ne: true};
        }
        return CreatureProperties.find(filter, {
          sort: {order: 1}
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
