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
    <div
      class="library-nodes"
    >
      <v-fade-transition mode="out-in">
        <div v-if="libraryNodes && libraryNodes.length">
          <section
            class="layout wrap justify-between"
          >
            <v-card
              v-for="node in libraryNodes"
              :key="node._id"
              hover
              ripple
              class="slot-card layout column justify-end"
              :class="{'selected': node._id === (selectedNode && selectedNode._id)}"
              :dark="node._id === (selectedNode && selectedNode._id)"
              @click="selectedNode = node"
            >
              <v-img
                v-if="node.picture"
                :src="node.picture"
                :height="200"
                contain
                class="slot-card-image"
              />
              <v-card-title primary-title>
                <tree-node-view
                  class="mr-2 text-h6 mb-0"
                  :class="{'theme--dark': node._id === (selectedNode && selectedNode._id)}"
                  :hide-icon="node.picture"
                  :model="node"
                  :color="node.color"
                />
              </v-card-title>
              <v-card-text
                v-if="node.description"
                class="pt-0"
              >
                <property-description
                  class="slot-card-text line-clamp"
                  :string="node.description"
                />
              </v-card-text>
            </v-card>
          </section>
        </div>
        <div
          v-else-if="countAll"
          class="ma-4"
        >
          <h4 v-if="numFiltered">
            Requirements of {{ numFiltered }} library properties were not met.
          </h4>
          <h4 v-else>
            Nothing suitable was found in your libraries.
          </h4>
        </div>
        <div
          v-else-if="$subReady.slotFillers"
          class="ma-4"
        >
          <h4>
            Nothing suitable was found in your libraries
            <span v-if="searchValue">
              matching "{{ searchValue }}"
            </span>
          </h4>
          <p>
            This slot requires a {{ slotPropertyTypeName }}
            <template v-if="model.slotTags.length == 1">
              with the tag <code>{{ model.slotTags[0] }}</code>,
            </template>
            <template v-else-if="model.slotTags.length > 1">
              with the following tags:
              <span
                v-for="(tag, index) in model.slotTags"
                :key="index"
              >
                <code>{{ tag }}</code>,
              </span>
            </template>
            <span v-if="model.spaceLeft">
              that fills less than {{ model.spaceLeft }} {{ model.spaceLeft == 1 && 'slot' || 'slots' }}
            </span>
          </p>
        </div>
      </v-fade-transition>
      <v-fade-transition mode="out-in">
        <div
          v-if="!$subReady.slotFillers"
          key="character-loading"
          class="fill-height layout justify-center align-center"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          />
        </div>
      </v-fade-transition>
      <v-fade-transition mode="out-in">
        <div
          v-if="currentLimit < countAll"
          class="layout justify-center align-stretch"
        >
          <v-btn
            :loading="!$subReady.slotFillers"
            class="primary"
            @click="loadMore"
          >
            Load More
          </v-btn>
        </div>
      </v-fade-transition>
    </div>
    <template slot="actions">
      <v-spacer />
      <v-btn
        text
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
      <v-btn
        text
        :disabled="!selectedNode"
        @click="insert"
      >
        Insert
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import PROPERTIES from '/imports/constants/PROPERTIES.js';
import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';
import PropertyDescription from '/imports/ui/properties/viewers/shared/PropertyDescription.vue'
import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';

export default {
  components: {
		DialogBase,
    TreeNodeView,
    PropertyDescription,
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
    selectedNode: undefined,
    searchValue: undefined,
    numFiltered: 0,
  }},
  computed: {
    slotPropertyTypeName(){
      if (!this.model) return;
      if (!this.model.slotType) return 'property';
      let propName = getPropertyName(this.model.slotType);
      return propName && propName.toLowerCase();
    },
  },
  reactiveProvide: {
    name: 'context',
    include: ['creatureId'],
  },
  methods:{
    getTitle(model){
      if (!model) return;
      if (model.name) return model.name;
      let prop = PROPERTIES[model.type]
      return prop && prop.name;
    },
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
    }
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
    libraryNodes(){
      let filter = {
        removed: {$ne: true},
      };
      if (this.model.slotTags && this.model.slotTags.length){
        filter.tags = {$all: this.model.slotTags};
      }
      if (this.model.slotType){
        filter.$or = [{
            type: this.model.slotType
          },{
            type: 'slotFiller',
            slotFillerType: this.model.slotType,
        }];
      }
      let nodes = LibraryNodes.find(filter, {
        sort: {name: 1, order: 1}
      }).fetch();
      let totalNodes = nodes.length;
      // Filter out slotFillers whose condition isn't met or are too big to fit
      // the quantity to fill
      nodes = nodes.filter(node => {
        if (node.slotFillerCondition){
          let {result} = evaluateString({
            string: node.slotFillerCondition,
            scope: this.creature.variables,
            fn: 'reduce',
          });
          if (!result.value) return false;
        }
        if (
          node.type === 'slotFiller' &&
          this.model.spaceLeft > 0 &&
          node.slotQuantityFilled > this.model.spaceLeft
        ){
          return false;
        }
        return true;
      });
      this.numFiltered = totalNodes - nodes.length;
      if (nodes.length === 1) this.selectedNode = nodes[0];
      return nodes;
    },
  }
}
</script>

<style lang="css" scoped>
  .slot-card {
    max-width: 500px;
    width: 300px;
    flex-grow: 1;
    flex-shrink: 1;
    margin: 4px;
  }
  .slot-card-text.line-clamp {
    -webkit-line-clamp: 5;
  }
  .slot-card.selected {
    background: #8E1B1B;
  }
</style>
