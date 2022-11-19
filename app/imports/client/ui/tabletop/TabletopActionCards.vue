<template lang="html">
  <div class="action-cards">
    <action-card
      v-for="action in actions"
      :key="action._id"
      :model="action"
    />
  </div>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import ActionCard from '/imports/client/ui/properties/components/actions/ActionCard.vue';

function getProperties(ancestorId, type){
  if (!ancestorId) return [];
  return CreatureProperties.find({
    'ancestors.id': ancestorId,
    type,
    removed: {$ne: true},
    inactive: {$ne: true},
  }, {
    sort: {order: 1}
  });
}

export default {
  components: {
    ActionCard,
  },
  props: {
    creatureId: {
      type: String,
      default: undefined,
    },
  },
  data(){ return {
    actionType: 'action',
  }},
  meteor: {
    actions(){
      return getProperties(this.creatureId, 'action');
    },
    attacks(){
      return getProperties(this.creatureId, 'attack');
    },
    spells(){
      return getProperties(this.creatureId, 'spell');
    },
  }
}
</script>

<style lang="css" scoped>
</style>
