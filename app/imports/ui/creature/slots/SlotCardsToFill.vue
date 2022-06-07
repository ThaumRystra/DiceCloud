<template>
  <div class="slots-to-fill">
    <v-slide-y-transition
      group
      class="d-flex flex-row flex-wrap"
    >
      <slot-card
        v-for="slot in slots"
        :key="slot._id"
        :model="slot"
        class="ma-1"
        hover
        @ignore="ignoreSlot(slot._id)"
        @click="fillSlot(slot._id)"
      />
    </v-slide-y-transition>
  </div>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import SlotCard from '/imports/ui/creature/slots/SlotCard.vue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty.js';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode.js';
import { snackbar } from '/imports/ui/components/snackbars/SnackbarQueue.js';

export default {
  components: {
    SlotCard,
  },
  inject: {
    context: { default: {} }
  },
  methods: {
    ignoreSlot(_id){
      updateCreatureProperty.call({
        _id,
        path: ['ignored'],
        value: true
      }, error => {
        if (error){
          console.error(error);
          snackbar(error);
        }
      });
    },
    fillSlot(slotId){
      this.$store.commit('pushDialogStack', {
        component: 'slot-fill-dialog',
        elementId: `slot-card-${slotId}`,
        data: {
          slotId,
          creatureId: this.context.creatureId,
        },
        callback(nodeIds){
          if (!nodeIds || !nodeIds.length) return;
          let newPropertyId = insertPropertyFromLibraryNode.call({
            nodeIds,
            parentRef: {
              'id': slotId,
              'collection': 'creatureProperties',
            },
          }, error => {
            if (error){
              console.error(error);
              snackbar(error);
            }
          });
          return `slot-child-${newPropertyId}`;
        }
      });
    },
  },
  meteor: {
    slots(){
      return CreatureProperties.find({
        type: 'propertySlot',
        'ancestors.id': this.context.creatureId,
        ignored: { $ne: true },
        $and: [
          { 
            $or: [
              {'slotCondition.value': {$nin: [false, 0, '']}},
              {'slotCondition.value': {$exists: false}},
            ]
          },{
            $or: [
              { quantityExpected: {exists: false} },
              { 'quantityExpected.value': 0 },
              {spaceLeft: {$gt: 0}},
            ]
          },
        ],        
        removed: {$ne: true},
        inactive: {$ne: true},
      });
    }
  }
}
</script>

<style>

</style>
