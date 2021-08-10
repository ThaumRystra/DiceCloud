<template lang="html">
  <div class="slots">
    <div
      v-for="slot in slots"
      :key="slot._id"
      class="slot"
    >
      <h3 class="layout align-center">
        {{ slot.name }}
        <v-spacer />
        <span v-if="slot.quantityExpectedResult > 1">
          {{ slot.totalFilled }} / {{ slot.quantityExpectedResult }}
        </span>
      </h3>
      <v-list v-if="slot.children.length">
        <v-list-item
          v-for="child in slot.children"
          :key="child._id"
          :data-id="`slot-child-${child._id}`"
          @click="clickSlotChild(child)"
        >
          <v-list-item-content>
            <tree-node-view
              class="slotChild"
              :model="child"
            />
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              icon
              small
              @click.stop="remove(child)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-btn
        v-if="!slot.quantityExpectedResult || slot.spaceLeft"
        icon
        :data-id="`slot-add-button-${slot._id}`"
        class="slot-add-button"
        style="background-color: inherit;"
        @click="fillSlot(slot)"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty.js';
import restoreProperty from '/imports/api/creature/creatureProperties/methods/restoreProperty.js';
import getPropertyTitle from '/imports/ui/properties/shared/getPropertyTitle.js';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode.js';
import { snackbar } from '/imports/ui/components/snackbars/SnackbarQueue.js';

export default {
  components: {
    TreeNodeView,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
    showHiddenSlots: {
      type: Boolean,
    },
  },
  methods: {
    clickSlotChild({_id}){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `slot-child-${_id}`,
				data: {_id},
			});
    },
    fillSlot(slot){
      let slotId = slot._id;
      let creatureId = this.creatureId;
      this.$store.commit('pushDialogStack', {
        component: 'slot-fill-dialog',
        elementId: `slot-add-button-${slotId}`,
        data: {
          slotId,
          creatureId,
        },
        callback(nodeIds){
          if (!nodeIds || !nodeIds.length) return;
          let newPropertyId = insertPropertyFromLibraryNode.call({
            nodeIds,
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
      snackbar({
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
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'propertySlot',
        $or: [
          {slotConditionResult: {$nin: [false, 0, '']}},
          {slotConditionResult: {$exists: false}},
        ],
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {order: 1}
      }).map(slot => {
        if (
          !this.showHiddenSlots &&
          slot.quantityExpectedResult === 0 &&
          slot.hideWhenFull
        ){
          slot.children = []
        } else {
          slot.children = CreatureProperties.find({
            'parent.id': slot._id,
            removed: {$ne: true},
          }, {
            sort: { order: 1 },
          }).fetch();
        }
        return slot;
      }).filter(slot => !( // Hide full and ignored slots
        !this.showHiddenSlots && (
          slot.hideWhenFull &&
          slot.quantityExpectedResult > 0 &&
          slot.spaceLeft <= 0 ||
          slot.ignored
        )
      ));
    },
  },
}
</script>

<style lang="css" scoped>
</style>
