<template lang="html">
  <dialog-base
    dark-body
  >
    <template slot="toolbar">
      <v-toolbar-title>
        Insert creatures
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
    <v-fade-transition>
      <div
        v-if="!$subReady.creatureTemplates"
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
        <v-expansion-panel
          v-for="libraryNode in [...selectedExcludedNodes, ...libraryNodes]"
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
      </v-expansion-panels>
    </v-fade-transition>
    <v-layout
      v-if="(!$subReady.creatureTemplates && !searchValue) || currentLimit < countAll"
      column
      align-center
      justify-center
      class="ma-3 mt-8"
    >
      <v-btn
        :loading="!$subReady.creatureTemplates"
        color="accent"
        outlined
        @click="loadMore"
      >
        Load More
      </v-btn>
    </v-layout>
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
        @click="openLibraryBrowser"
      >
        Browse community libraries
      </v-btn>
      <v-btn
        v-if="!dummySlot"
        text
        small
        data-id="custom-button"
        @click="insertCustomFiller"
      >
        Insert New Creature
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
        Insert
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
import Libraries from '/imports/api/library/Libraries';
import LibraryNodeExpansionContent from '/imports/client/ui/library/LibraryNodeExpansionContent.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import { clone, difference } from 'lodash';
import getDefaultSlotFiller from '/imports/api/library/methods/getDefaultSlotFiller';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import insertProperty from '/imports/api/creature/creatureProperties/methods/insertProperty';

export default {
  components: {
    DialogBase,
    TreeNodeView,
    LibraryNodeExpansionContent,
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
      autoSelectRan: false,
    }
  },
  reactiveProvide: {
    name: 'context',
    include: ['creatureId'],
  },
  watch: {
    activeCount(val) {
      // Still loading fillers
      if (!this._subs['creatureTemplates'].ready()) return;
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
      this._subs['creatureTemplates'].setData('limit', this.currentLimit + 50);
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
      //TODO
      return;
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
      'creatureTemplates'() {
        return [this.searchValue || undefined]
      },
    },
    searchLoading() {
      return !!this.searchValue && !this.$subReady.creatureTemplates;
    },
    currentLimit() {
      return this._subs['creatureTemplates'].data('limit') || 50;
    },
    countAll() {
      return this._subs['creatureTemplates'].data('countAll');
    },
    activeCount() {
      if (!this.libraryNodes) return;
      return this.libraryNodes.length;
    },
    libraryNodeFilter() {
      const filterString = this._subs['creatureTemplates'].data('libraryNodeFilter');
      if (!filterString) return;
      return EJSON.parse(filterString);
    },
    libraryNames() {
      let names = {};
      Libraries.find().forEach(lib => names[lib._id] = lib.name)
      return names;
    },
    libraryNodes() {
      if (!this.libraryNodeFilter) return [];
      if (!this.$subReady.creatureTemplates) return [];
      let nodes = LibraryNodes.find(this.libraryNodeFilter, {
        sort: { name: 1, order: 1 }
      }).fetch();

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
