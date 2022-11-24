<template lang="html">
  <div
    v-if="attributes.length"
    class="px-2 pt-2"
  >
    <health-bar-card
      :attributes="attributes"
      @change="healthBarChanged"
      @click="healthBarClicked"
    />
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import damageProperty from '/imports/api/creature/creatureProperties/methods/damageProperty.js';

import HealthBarCard from '/imports/client/ui/properties/components/attributes/HealthBarCard.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';

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
    creature() {
      return Creatures.findOne(this.creatureId, { fields: { settings: 1 } });
    },
    attributes() {
      let creature = this.creature;
      if (!creature) return;
      let filter = {
        'ancestors.id': creature._id,
        type: 'attribute',
        attributeType: 'healthBar',
        removed: { $ne: true },
        inactive: { $ne: true },
        overridden: { $ne: true },
        $nor: [
          { hideWhenTotalZero: true, total: 0 },
          { hideWhenValueZero: true, value: 0 },
        ],
      };
      if (creature.settings.hideUnusedStats) {
        filter.hide = { $ne: true };
      }
      return CreatureProperties.find(filter, {
        sort: { order: 1 }
      });
    },
  },
  methods: {
    healthBarClicked({ _id }) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${_id}`,
        data: { _id },
      });
    },
    healthBarChanged({ _id, change }) {
      damageProperty.call({
        _id,
        operation: change.type,
        value: change.value
      });
    },
  },
};
</script>
