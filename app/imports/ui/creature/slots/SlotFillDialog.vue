<template lang="html">
  <dialog-base
    :color="model.color"
    dark-body
  >
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer />
      <text-field
        prepend-inner-icon="mdi-magnify"
        regular
        hide-details
        :value="searchValue"
        :debounce="300"
        @change="searchChanged"
        @keyup.enter="insert"
      />
    </template>
    <property-description
      :string="model.description"
    />
    <v-expansion-panels
      multiple
      inset
    >
      <template v-for="libraryNode in libraryNodes">
        <v-expansion-panel
          v-if="showDisabled || !libraryNode._disabledBySlotFillerCondition"
          :key="libraryNode._id"
          :model="libraryNode"
          :data-id="libraryNode._id"
          :class="{disabled: libraryNode._disabled}"
        >
          <v-expansion-panel-header>
            <template #default="{ open }">
              <v-checkbox
                v-model="selectedNodeIds"
                class="my-0 py-0 mr-2 flex-grow-0"
                hide-details
                :value="libraryNode._id"
                :disabled="libraryNode._disabled"
                @click.stop
              />
              <v-layout column>
                <v-layout>
                  <tree-node-view :model="libraryNode" />
                  <div
                    v-if="libraryNode._disabledBySlotFillerCondition"
                    class="error--text"
                  >
                    {{ libraryNode.slotFillerCondition }}
                  </div>
                </v-layout>
                <div class="text-caption">
                  {{ libraryNames[libraryNode.ancestors[0].id ] }}
                </div>
              </v-layout>
              <template v-if="open">
                <v-btn
                  icon
                  class="flex-grow-0"
                  @click.stop="openPropertyDetails(libraryNode._id)"
                >
                  <v-icon>mdi-window-restore</v-icon>
                </v-btn>
              </template>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <library-node-expansion-content :model="libraryNode" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </template>
    </v-expansion-panels>
    <template v-if="!showDisabled && disabledNodeCount">
      <v-layout
        column
        align-center
        justify-center
      >
        <div class="mt-4 ma-2">
          Requirements of {{ disabledNodeCount }} properties were not met
        </div>
        <v-btn
          elevation="0"
          color="accent"
          @click="showDisabled = true"
        >
          Show All
        </v-btn>
      </v-layout>
    </template>
    <template slot="actions">
      <v-btn
        text
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :disabled="!selectedNodeIds.length"
        @click="$store.dispatch('popDialogStack', selectedNodeIds)"
      >
        <template v-if="selectedNodeIds.length >= 15">
          {{ selectedNodeIds.length }}/20
        </template>
        Insert
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
/**
 * TODO
 * Show the tags that are being searched for/against
 * Show the quantity to fill with this dialog
 * Show the quantity filled by the selection
 * Enforce unique in slot/unique in character selection rules
 * Fix the dialog callback for multiple property inserting
 * Show the dialog in library view to test slots
 */
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';
import PropertyDescription from '/imports/ui/properties/viewers/shared/PropertyDescription.vue'
import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';
import getSlotFillFilter from '/imports/api/creature/creatureProperties/methods/getSlotFillFilter.js'
import Libraries from '/imports/api/library/Libraries.js';
import LibraryNodeExpansionContent from '/imports/ui/library/LibraryNodeExpansionContent.vue';

export default {
  components: {
		DialogBase,
    TreeNodeView,
    PropertyDescription,
    LibraryNodeExpansionContent,
	},
  props:{
    slotId: {
      type: String,
      required: true,
    },
    creatureId: {
      type: String,
      required: true,
    },
  },
  data(){return {
    selectedNodeIds: [],
    searchValue: undefined,
    showDisabled: false,
    disabledNodeCount: undefined,
  }},
  reactiveProvide: {
    name: 'context',
    include: ['creatureId'],
  },
  methods: {
    searchChanged(val, ack){
      this._subs['slotFillers'].setData('searchTerm', val);
      this._subs['slotFillers'].setData('limit', undefined);
      this.selectedNode = undefined;
      this.searchValue = val;
      setTimeout(ack, 200);
    },
    loadMore(){
      if (this.currentLimit >= this.countAll) return;
      this._subs['slotFillers'].setData('limit', this.currentLimit + 50);
    },
    insert(){
      if (!this.selectedNode) return;
      this.$store.dispatch('popDialogStack', this.selectedNode);
    },
    openPropertyDetails(id){
      this.$store.commit('pushDialogStack', {
        component: 'library-node-dialog',
        elementId: id,
        data: {
          _id: id,
        },
      });
    },
  },
  meteor: {
    $subscribe: {
      'slotFillers'(){
        return [this.slotId]
      },
    },
    model(){
      return CreatureProperties.findOne(this.slotId);
    },
    creature(){
      return Creatures.findOne(this.creatureId);
    },
    currentLimit(){
      return this._subs['slotFillers'].data('limit') || 50;
    },
    countAll(){
      return this._subs['slotFillers'].data('countAll');
    },
    totalQuantitySelected(){
      return 0; //TODO
    },
    spaceLeft(){
      if (this.model.quantityExpectedResult === 0) return undefined;
      return this.model.spaceLeft - this.totalQuantitySelected;
    },
    libraryNames(){
      let names = {};
      Libraries.find().forEach(lib => names[lib._id] = lib.name)
      return names;
    },
    libraryNodes(){
      let filter = getSlotFillFilter({slot: this.model});
      let nodes = LibraryNodes.find(filter, {
        sort: {name: 1, order: 1}
      }).fetch();
      let disabledNodeCount = 0;
      // Mark slotFillers whose condition isn't met or are too big to fit
      // the quantity to fill
      nodes.forEach(node => {
        if (node.slotFillerCondition){
          let {result} = evaluateString({
            string: node.slotFillerCondition,
            scope: this.creature.variables,
            fn: 'reduce',
          });
          if (!result.value){
            node._disabled = true;
            node._disabledBySlotFillerCondition = true;
          }
        }
        let quantityToFill = node.type === 'slotFiller' ? node.slotQuantityFilled : 1;
        if (
          quantityToFill > this.spaceLeft
        ){
          node._disabled = true;
          node._disabledByQuantityFilled = true;
        }
        if (node._disabledBySlotFillerCondition){
          disabledNodeCount += 1;
        }
      });
      if (nodes.length === 1) this.selectedNode = nodes[0];
      this.disabledNodeCount = disabledNodeCount;
      return nodes;
    },
  }
}
</script>

<style lang="css" scoped>
  .disabled {
    opacity: 0.7;
  }
</style>
