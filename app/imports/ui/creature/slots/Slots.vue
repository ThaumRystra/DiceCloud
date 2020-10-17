<template lang="html">
  <div class="slots">
    <div
      v-for="slot in slots"
      :key="slot._id"
      class="slot"
    >
      <h3 class="layout row align-center">
        {{ slot.name }}
        <v-spacer />
        <span v-if="slot.quantityExpected > 1">
          {{ slot.totalFilled }} / {{ slot.quantityExpected }}
        </span>
      </h3>
      <div
        v-for="child in slot.children"
        :key="child._id"
        class="layout row"
        :data-id="`slot-child-${child._id}`"
      >
        <tree-node-view
          class="slotChild"
          :model="child"
        />
        <v-spacer />
        <v-btn
          icon
          flat
          small
          @click="remove(child)"
        >
          <v-icon>delete</v-icon>
        </v-btn>
      </div>
      <v-btn
        v-if="!slot.quantityExpected || slot.quantityExpected > slot.totalFilled"
        icon
        :data-id="`slot-add-button-${slot._id}`"
        style="background-color: inherit;"
        @click="fillSlot(slot)"
      >
        <v-icon>add</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';
import {
  insertPropertyFromLibraryNode,
  softRemoveProperty,
  restoreProperty
} from '/imports/api/creature/CreatureProperties.js';
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';
import getPropertyTitle from '/imports/ui/properties/shared/getPropertyTitle.js';

export default {
  components: {
    TreeNodeView,
  },
  inject: {
    context: { default: {} }
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  methods: {
    fillSlot(slot){
      let slotId = slot._id;
      let creatureId = this.creatureId;
      let numToFill = slot.quantityExpected === 0 ?
        0 : slot.quantityExpected - slot.totalFilled;
      this.$store.commit('pushDialogStack', {
        component: 'slot-fill-dialog',
        elementId: `slot-add-button-${slotId}`,
        data: {
          slotId,
          creatureId,
          numToFill,
        },
        callback(node){
					if(!node) return;
          let newPropertyId = insertPropertyFromLibraryNode.call({
            nodeId: node._id,
            parentRef: {
              'id': slotId,
              'collection': 'creatureProperties',
            },
          });
          return `slot-child-${newPropertyId}`;
				}
      });
    },
    remove(model){
      softRemoveProperty.call({_id: model._id});
      this.$store.dispatch('snackbar', {
        text: `Deleted ${getPropertyTitle(model)}`,
        callbackName: 'undo',
        callback(){
          restoreProperty.call({_id: model._id});
        },
      });
    }
  },
  meteor: {
    slots(){
      return getActiveProperties({
        ancestorId: this.creatureId,
        filter: {
          type: 'propertySlot',
          $or: [
            {slotConditionResult: true},
            {slotConditionResult: {$exists: false}},
          ],
        }
      }).map(slot => {
        slot.children = CreatureProperties.find({
          'parent.id': slot._id,
          removed: {$ne: true},
        }).fetch();
        slot.totalFilled = 0;
        slot.children.forEach(child => {
          if (child.type === 'slotFiller'){
            slot.totalFilled += child.slotQuantityFilled;
          } else {
            slot.totalFilled++;
          }
        });
        return slot;
      });
    },
  },
}
</script>

<style lang="css" scoped>
  div {
    background-color: inherit;
  }
</style>
