<script setup lang="ts">
import { ref, reactive, computed, watch, toRef, provide } from 'vue';
import { useStore } from 'vuex';
import { autorun, subscribe } from 'vue-meteor-tracker';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import Libraries from '/imports/api/library/Libraries';
import LibraryNodeExpansionContent from '/imports/client/ui/library/LibraryNodeExpansionContent.vue';
import { difference } from 'lodash';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  slotId?: string;
  creatureId?: string;
  dummySlot?: object;
}>();

const store = useStore(key);

provide('context', reactive({ creatureId: toRef(props, 'creatureId') }));

const selectedNodeIds = ref<string[]>([]);
const searchInput = ref<string | undefined>(undefined);
const searchValue = ref<string | undefined>(undefined);
const autoSelectRan = ref(false);
const currentLimit = ref(50);

const hasMore = computed(() => libraryNodes.value && libraryNodes.value.length >= currentLimit.value);

const { ready: creatureTemplatesReady } = subscribe(() => ['creatureTemplates', searchValue.value || undefined, currentLimit.value]);

const { result: searchLoading } = autorun(() => !!searchValue.value && !creatureTemplatesReady.value);

const { result: libraryNames } = autorun(() => {
  const names: Record<string, string> = {};
  Libraries.find().forEach((lib: any) => { names[lib._id] = lib.name; });
  return names;
});

const { result: libraryNodes } = autorun(() => {
  if (!creatureTemplatesReady.value) return [];
  const nodes = LibraryNodes.find({ _creatureTemplateResult: true }, {
    sort: { name: 1, order: 1 },
  }).fetch();

  if (!autoSelectRan.value) {
    autoSelectRan.value = true;
    if (nodes.length === 1 && !nodes[0]._disabled && !selectedNodeIds.value?.length) {
      selectedNodeIds.value = [nodes[0]._id];
    }
  }
  return nodes;
});

const activeCount = computed(() => libraryNodes.value?.length ?? 0);

const { result: selectedExcludedNodes } = autorun(() => {
  const displayedIds = (libraryNodes.value ?? []).map((node: any) => node._id);
  const excludedNodeIds = difference(selectedNodeIds.value, displayedIds);
  return LibraryNodes.find({ _id: { $in: excludedNodeIds } });
});

watch(activeCount, (val) => {
  if (!creatureTemplatesSubReady.value) return;
  if (hasMore.value && val < 25) {
    loadMore();
  }
});

function loadMore() {
  if (!hasMore.value) return;
  currentLimit.value += 50;
}

function openPropertyDetails(id: string) {
  store.commit('pushDialogStack', {
    component: 'library-node-dialog',
    elementId: id,
    data: { _id: id },
  });
}

function openLibraryBrowser() {
  store.commit('pushDialogStack', {
    component: 'library-browser-dialog',
    elementId: 'library-browser-button',
  });
}

function isDisabled(node: any) {
  return node._disabledByAlreadyAdded ||
    (node._disabledByQuantityFilled && !selectedNodeIds.value.includes(node._id));
}

function insertCustomFiller() {
  // TODO
  return;
}
</script>

<template lang="html">
  <dialog-base dark-body>
    <template #toolbar>
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
        v-if="!creatureTemplatesReady"
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
        variant="accordion"
        rounded="0"
        multiple
        hover
      >
        <v-expansion-panel
          v-for="libraryNode in [...selectedExcludedNodes, ...libraryNodes]"
          :key="libraryNode._id"
          :model="libraryNode"
          :data-id="libraryNode._id"
          :class="{ disabled: isDisabled(libraryNode) || libraryNode._disabledBySlotFillerCondition }"
        >
          <v-expansion-panel-title>
            <template #default="{ open }">
              <div class="d-flex align-center flex-grow-0 mr-2">
                <v-checkbox
                  v-if="libraryNode._disabledByAlreadyAdded"
                  class="my-0 py-0"
                  hide-details
                  :model-value="true"
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
              </div>
              <div class="d-flex flex-column">
                <div class="d-flex align-center">
                  <tree-node-view :model="libraryNode" />
                  <div
                    v-if="libraryNode._disabledBySlotFillerCondition"
                    class="text-error text-no-wrap text-truncate"
                  >
                    {{ libraryNode._conditionError }}
                  </div>
                </div>
                <div class="text-caption text-no-wrap text-truncate">
                  {{ libraryNames[libraryNode.root.id] }}
                </div>
              </div>
              <div
                v-if="libraryNode.slotQuantityFilled !== undefined && libraryNode.slotQuantityFilled !== 1"
                class="text-overline flex-grow-0 text-no-wrap"
                :class="{
                  'text-error': isDisabled(libraryNode) &&
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
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <library-node-expansion-content :id="libraryNode._id" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-fade-transition>
    <div
      v-if="(!creatureTemplatesReady && !searchValue) || hasMore"
      class="d-flex flex-column align-center justify-center ma-3 mt-8"
    >
      <v-btn
        :loading="!creatureTemplatesReady"
        color="accent"
        variant="outlined"
        @click="loadMore"
      >
        Load More
      </v-btn>
    </div>
    <div class="d-flex align-center justify-center text-caption text-disabled mt-8 mb-2">
      Can't find what you're looking for?
    </div>
    <div class="d-flex align-center justify-center flex-wrap mx-4 mb-4">
      <v-btn
        v-if="!dummySlot"
        variant="text"
        size="small"
        data-id="library-browser-button"
        @click="openLibraryBrowser"
      >
        Browse community libraries
      </v-btn>
      <!-- <v-btn
        v-if="!dummySlot"
        variant="text"
        size="small"
        data-id="custom-button"
        @click="insertCustomFiller"
      >
        Insert New Creature
      </v-btn> -->
    </div>

    <template #actions>
      <v-btn
        variant="text"
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :disabled="!dummySlot && !selectedNodeIds.length"
        @click="$store.dispatch('popDialogStack', selectedNodeIds)"
      >
        Insert
      </v-btn>
    </template>
  </dialog-base>
</template>

<style lang="css" scoped>
.disabled {
  opacity: 0.7;
}
</style>
