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
      <v-text-field
        v-model="searchInput"
        prepend-inner-icon="mdi-magnify"
        regular
        clearable
        hide-details
        class="flex-grow-0"
        style="flex-basis: 300px;"
        :loading="searchLoading"
        @change="searchValue = searchInput || undefined"
        @click:clear="searchValue = undefined"
      />
    </template>
    <property-description
      text
      :string="model.description"
    />
    <p>
      {{ slotPropertyTypeName }} with library tags:
      <property-tags
        v-for="(tags, index) in tagsSearched.or"
        :key="index + 'tags'"
        :tags="tags"
        :prefix="index ? 'OR' : undefined"
      />
      <property-tags
        v-for="(tags, index) in tagsSearched.not"
        :key="index + 'not'"
        :tags="tags"
        prefix="NOT"
      />
    </p>
    <v-fade-transition>
      <div
        v-if="!$subReady.slotFillers"
        class="fill-height layout justify-center align-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
      </div>
      <v-expansion-panels
        v-else
        accordion
        tile
        multiple
        hover
      >
        <template v-for="libraryNode in [...selectedExcludedNodes, ...libraryNodes]">
          <v-expansion-panel
            v-if="showDisabled || !libraryNode._disabledBySlotFillerCondition"
            :key="libraryNode._id"
            :model="libraryNode"
            :data-id="libraryNode._id"
            :class="{disabled: isDisabled(libraryNode) || libraryNode._disabledBySlotFillerCondition}"
          >
            <v-expansion-panel-header>
              <template #default="{ open }">
                <v-layout
                  align-center
                  class="flex-grow-0 mr-2"
                >
                  <v-checkbox
                    v-if="libraryNode._disabledByAlreadyAdded"
                    class="my-0 py-0"
                    hide-details
                    :input-value="true"
                    disabled
                  />
                  <v-checkbox
                    v-else
                    v-model="selectedNodeIds"
                    class="my-0 py-0"
                    hide-details
                    :color="libraryNode._disabledBySlotFillerCondition ? 'error' : ''"
                    :disabled="isDisabled(libraryNode)"
                    :value="libraryNode._id"
                    @click.stop
                  />
                </v-layout>
                <v-layout column>
                  <v-layout align-center>
                    <tree-node-view :model="libraryNode" />
                    <div
                      v-if="libraryNode._disabledBySlotFillerCondition"
                      class="error--text text-no-wrap text-truncate"
                    >
                      {{ libraryNode._conditionError }}
                    </div>
                  </v-layout>
                  <div class="text-caption text-no-wrap text-truncate">
                    {{ libraryNames[libraryNode.root.id ] }}
                  </div>
                </v-layout>
                <div
                  v-if="libraryNode.slotQuantityFilled !== undefined && libraryNode.slotQuantityFilled !== 1"
                  class="text-overline flex-grow-0 text-no-wrap"
                  :class="{
                    'error--text': isDisabled(libraryNode) &&
                      libraryNode._disabledByQuantityFilled
                  }"
                >
                  {{ libraryNode.slotQuantityFilled }} slots
                </div>
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
              <library-node-expansion-content :id="libraryNode._id" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </template>
      </v-expansion-panels>
    </v-fade-transition>
    <v-layout
      v-if="(!$subReady.slotFillers && !searchValue) || currentLimit < countAll"
      column
      align-center
      justify-center
      class="ma-3 mt-8"
    >
      <v-btn
        :loading="!$subReady.slotFillers"
        color="accent"
        outlined
        @click="loadMore"
      >
        Load More
      </v-btn>
    </v-layout>
    <template v-if="!showDisabled && disabledNodeCount">
      <v-layout
        column
        align-center
        justify-center
        class="ma-3 mt-8"
      >
        <div>
          Requirements of {{ disabledNodeCount }} properties were not met
        </div>
        <v-btn
          class="mt-2"
          elevation="0"
          color="accent"
          outlined
          @click="showDisabled = true"
        >
          Show All
        </v-btn>
      </v-layout>
    </template>
    <v-layout
      align-center
      justify-center
      class="text-caption text--disabled mt-8 mb-2"
    >
      Can't find what you're looking for?
    </v-layout>
    <v-layout
      align-center
      justify-center
      wrap
      class="mx-4 mb-4"
    >
      <v-btn
        v-if="!dummySlot"
        text
        small
        data-id="library-browser-button"
        :disabled="!model"
        @click="openLibraryBrowser"
      >
        Browse community libraries
      </v-btn>
      <v-btn
        v-if="!dummySlot"
        text
        small
        :disabled="!model"
        data-id="custom-button"
        @click="insertCustomFiller"
      >
        Create custom filler
      </v-btn>
    </v-layout>
    
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
        :disabled="!dummySlot && !selectedNodeIds.length"
        @click="$store.dispatch('popDialogStack', selectedNodeIds)"
      >
        <template v-if="model.spaceLeft">
          {{ totalQuantitySelected }} / {{ model.spaceLeft }}
        </template>
        <template v-if="slotId">
          Insert
        </template>
        <template v-else>
          Close Test
        </template>
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue'
import resolve, { toString } from '/imports/parser/resolve';
import { prettifyParseError, parse } from '/imports/parser/parser';
import Libraries from '/imports/api/library/Libraries';
import LibraryNodeExpansionContent from '/imports/client/ui/library/LibraryNodeExpansionContent.vue';
import PropertyTags from '/imports/client/ui/properties/viewers/shared/PropertyTags.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import { clone, difference } from 'lodash';
import getDefaultSlotFiller from '/imports/api/library/methods/getDefaultSlotFiller';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import insertProperty from '/imports/api/creature/creatureProperties/methods/insertProperty';

export default {
  components: {
    DialogBase,
    TreeNodeView,
    PropertyDescription,
    LibraryNodeExpansionContent,
    PropertyTags,
  },
  props: {
    slotId: {
      type: String,
      default: undefined,
    },
    creatureId: {
      type: String,
      default: undefined,
    },
    dummySlot: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      selectedNodeIds: [],
      searchInput: undefined,
      searchValue: undefined,
      showDisabled: false,
      disabledNodeCount: undefined,
      autoSelectRan: false,
    }
  },
  reactiveProvide: {
    name: 'context',
    include: ['creatureId'],
  },
  computed: {
    tagsSearched() {
      let or = [];
      let not = [];
      if (this.model.slotTags && this.model.slotTags.length) {
        or.push(this.model.slotTags);
      }
      this.model.extraTags?.forEach(extras => {
        if (extras.tags?.length) {
          if (extras.operation === 'OR') {
            or.push(extras.tags);
          } else if (extras.operation === 'NOT') {
            not.push(extras.tags);
          }
        }
      });
      return { or, not };
    },
    slotPropertyTypeName() {
      if (!this.model) return;
      if (!this.model.slotType) return 'Property';
      let propName = getPropertyName(this.model.slotType);
      return propName;
    },
  },
  watch: {
    activeCount(val) {
      // Still loading fillers
      if (!this._subs['slotFillers'].ready()) return;
      // Can load more, and not showing enough active choices, so load more
      if (
        this.currentLimit < this.countAll
        && val < 25
      ) {
        this.loadMore();
      }
    },
  },
  methods: {
    loadMore() {
      if (this.currentLimit >= this.countAll) return;
      this._subs['slotFillers'].setData('limit', this.currentLimit + 50);
    },
    openPropertyDetails(id) {
      this.$store.commit('pushDialogStack', {
        component: 'library-node-dialog',
        elementId: id,
        data: {
          _id: id,
        },
      });
    },
    openLibraryBrowser() {
      this.$store.commit('pushDialogStack', {
        component: 'library-browser-dialog',
        elementId: 'library-browser-button',
      });
    },
    isDisabled(node) {
      return node._disabledByAlreadyAdded ||
        (
          node._disabledByQuantityFilled &&
          !this.selectedNodeIds.includes(node._id)
        )
    },
    insertCustomFiller() {
      if (!this.model) return;
      const prop = getDefaultSlotFiller(this.model);
      const parentRef = { id: this.slotId, collection: 'creatureProperties' };
      const order = this.model.order + 0.5;
      const $store = this.$store;
      $store.commit('pushDialogStack', {
        component: 'insert-property-dialog',
        elementId: 'custom-button',
        data: {
          parentDoc: this.model,
          creatureId: this.creatureId,
          prop,
          noBackdropClose: true,
        },
        callback(result) {
          if (!result) return;
          if (Array.isArray(result)){
            let nodeIds = result;
            insertPropertyFromLibraryNode.call({ nodeIds, parentRef, order });
            setTimeout(() => $store.dispatch('popDialogStack'), 200);
          } else if (typeof result === 'object') {
            let creatureProperty = result;
            creatureProperty.order = order;
            insertProperty.call({ creatureProperty, parentRef });
            setTimeout(() => $store.dispatch('popDialogStack'), 200);

            /* Maybe replace the dialog with the edit version? 
             * It's a bit jank, but a common use case
            $store.commit('replaceDialog', {
              component: 'creature-property-dialog',
              //elementId: `?`,
              data: {
                _id,
                startInEditTab: true,
              },
            });
            */
           
          }
        }
      });
    },
  },
  meteor: {
    $subscribe: {
      'slotFillers'() {
        return [this.slotId || this.dummySlot?._id, this.searchValue || undefined, !!this.dummySlot]
      },
      'selectedFillers'() {
        return [this.slotId || this.dummySlot?._id, this.selectedNodeIds, !!this.dummySlot]
      },
    },
    searchLoading() {
      return !!this.searchValue && !this.$subReady.slotFillers;
    },
    model() {
      if (this.slotId) {
        return CreatureProperties.findOne(this.slotId);
      } else if (this.dummySlot) {
        let model = clone(this.dummySlot)
        if (!model.quantityExpected) model.quantityExpected = {};
        model.quantityExpected.value = +model.quantityExpected.calculation;
        model.spaceLeft = model.quantityExpected.value;
        return model;
      }
    },
    variables() {
      if (!this.creatureId) return {};
      return CreatureVariables.findOne({ _creatureId: this.creatureId }) || {};
    },
    currentLimit() {
      return this._subs['slotFillers'].data('limit') || 50;
    },
    countAll() {
      return this._subs['slotFillers'].data('countAll');
    },
    activeCount() {
      if (!this.libraryNodes) return;
      return this.libraryNodes.length - (this.disabledNodeCount || 0);
    },
    libraryNodeFilter() {
      const filterString = this._subs['slotFillers'].data('libraryNodeFilter');
      if (!filterString) return;
      return EJSON.parse(filterString);
    },
    alreadyAdded() {
      let added = new Set();
      if (!this.model.unique) return added;
      let rootId;
      if (this.model.unique === 'uniqueInSlot') {
        rootId = this.model._id;
      } else if (this.model.unique === 'uniqueInCreature') {
        rootId = this.creatureId;
      }
      CreatureProperties.find({
        'root.id': rootId,
        libraryNodeId: { $exists: true },
        removed: { $ne: true },
      }, {
        fields: { libraryNodeId: 1 },
      }).forEach(prop => {
        added.add(prop.libraryNodeId);
      });
      return added;
    },
    totalQuantitySelected() {
      let quantitySelected = 0;
      LibraryNodes.find({
        _id: { $in: this.selectedNodeIds }
      }, {
        fields: { slotQuantityFilled: 1 },
      }).forEach(node => {
        if (Number.isFinite(node.slotQuantityFilled)) {
          quantitySelected += node.slotQuantityFilled;
        } else {
          quantitySelected += 1;
        }
      });
      return quantitySelected;
    },
    spaceLeft() {
      if (!this.model.quantityExpected || this.model.quantityExpected.value === 0) return undefined;
      return this.model.spaceLeft - this.totalQuantitySelected;
    },
    libraryNames() {
      let names = {};
      Libraries.find().forEach(lib => names[lib._id] = lib.name)
      return names;
    },
    libraryNodes() {
      if (!this.libraryNodeFilter) return [];
      if (!this.$subReady.slotFillers) return [];
      let nodes = LibraryNodes.find(this.libraryNodeFilter, {
        sort: { name: 1, order: 1 }
      }).fetch();
      let disabledNodeCount = 0;
      // Mark slotFillers whose condition isn't met or are too big to fit
      // the quantity to fill
      nodes.forEach(node => {
        if (node.slotFillerCondition) {
          try {
            let parseNode = parse(node.slotFillerCondition);
            const { result: resultNode } = resolve('reduce', parseNode, this.variables);
            if (resultNode?.parseType === 'constant') {
              if (!resultNode.value) {
                node._disabled = true;
                node._disabledBySlotFillerCondition = true;
                node._conditionError = node.slotFillerConditionNote || node.slotFillerCondition;
                disabledNodeCount += 1;
              }
            } else {
              node._disabled = true;
              node._disabledBySlotFillerCondition = true;
              node._conditionError = node.slotFillerConditionNote || toString(resultNode);
              disabledNodeCount += 1;
            }
          } catch (e) {
            console.warn(e);
            let error = prettifyParseError(e);
            node._disabled = true;
            node._disabledBySlotFillerCondition = true;
            node._conditionError = 'Condition error: '+ error;
            disabledNodeCount += 1;
          }
        }
        let quantityToFill = typeof node.slotQuantityFilled == 'number' ? node.slotQuantityFilled : 1;
        if (
          quantityToFill > this.spaceLeft
        ) {
          node._disabled = true;
          node._disabledByQuantityFilled = true;
        }
        if (this.alreadyAdded.has(node._id)) {
          node._disabled = true;
          node._disabledByAlreadyAdded = true;
        }
      });
      // Only run the auto-select once
      if (!this.autoSelectRan) {
        this.autoSelectRan = true;
        // If we have exactly one active node and no selected nodes, pre-select it
        if (
          nodes.length === 1
          && !nodes[0]._disabled
          && !this.selectedNodeIds?.length
        ) {
          this.selectedNodeIds = [nodes[0]._id];
        }
      }
      this.disabledNodeCount = disabledNodeCount;
      return nodes;
    },
    selectedExcludedNodes() {
      const displayedIds = this.libraryNodes.map(node => node._id);
      const excludedNodeIds = difference(this.selectedNodeIds, displayedIds);
      return LibraryNodes.find({ _id: { $in: excludedNodeIds } });
    }
  }
}
</script>

<style lang="css" scoped>
.disabled {
  opacity: 0.7;
}
</style>
resolveimport { toString } from '/imports/parser/toString';
