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
        prepend-inner-icon="search"
        regular
        hide-details
        :value="searchValue"
        :debounce="200"
        @change="searchChanged"
        @keyup.enter="insert"
      />
    </template>
    <div
      class="library-nodes"
    >
      <v-fade-transition mode="out-in">
        <column-layout
          v-if="$subReady.slotFillers && libraryNodes && libraryNodes.length"
          wide-columns
        >
          <div
            v-for="node in libraryNodes"
            :key="node._id"
          >
            <v-card
              hover
              ripple
              class="slot-card"
              :class="{'primary': node._id === (selectedNode && selectedNode._id)}"
              :dark="node._id === (selectedNode && selectedNode._id)"
              @click="selectedNode = node"
            >
              <v-img
                v-if="node.picture"
                :src="node.picture"
                :height="200"
                contain
              />
              <v-card-title primary-title>
                <div>
                  <h3 class="title mb-0">
                    <tree-node-view
                      class="mr-2"
                      :class="{'theme--dark': node._id === (selectedNode && selectedNode._id)}"
                      :hide-icon="node.picture"
                      :model="node"
                      :color="node.color"
                    />
                  </h3>
                  <property-description
                    :string="model.description"
                    :calculations="model.descriptionCalculations"
                    :inactive="model.inactive"
                  />
                </div>
              </v-card-title>
            </v-card>
          </div>
        </column-layout>
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
        <div
          v-else
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
    </div>
    <template slot="actions">
      <v-spacer />
      <v-btn
        flat
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
      <v-btn
        flat
        :disabled="!selectedNode"
        @click="insert"
      >
        Insert
      </v-btn>
    </template>
  </dialog-base>
</template>

<script>
import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import { parse, CompilationContext } from '/imports/parser/parser.js';
import PROPERTIES from '/imports/constants/PROPERTIES.js';
import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';
import PropertyDescription from '/imports/ui/properties/viewers/shared/PropertyDescription.vue'

export default {
  components: {
		DialogBase,
    ColumnLayout,
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
      this.selectedNode = undefined;
      this.searchValue = val;
      setTimeout(ack, 200);
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
    libraryNodes(){
      let filter = {
        removed: {$ne: true},
      };
      if (this.searchValue){
        filter.name = {
          $regex: this.searchValue.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
          $options: 'i'
        };
      }
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
      let nodes = LibraryNodes.find(filter).fetch();
      // Filter out slotFillers whose condition isn't met or are too big to fit
      // the quantity to fill
      nodes = nodes.filter(node => {
        if (node.slotFillerCondition){
          let context = new CompilationContext();
          let conditionResult = parse(node.slotFillerCondition)
          .reduce(this.creature.variables, context);
          if (conditionResult && !conditionResult.value) return false;
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
      // Filter out slotFillers whose
      if (nodes.length === 1) this.selectedNode = nodes[0];
      return nodes;
    },
  }
}
</script>

<style lang="css" scoped>
.slot-card {
  max-width: 500px;
  width: 100%;
  display: inline-block;
}
</style>
