<script setup lang="ts">
import { ref, computed, reactive, watch, toRef, provide } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import CreatureProperties, { type CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import Libraries from '/imports/api/library/Libraries';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';
import resolve from '/imports/parser/resolve';
import { prettifyParseError, parse } from '/imports/parser/parser';
import LibraryNodeExpansionContent from '/imports/client/ui/library/LibraryNodeExpansionContent.vue';
import PropertyTags from '/imports/client/ui/properties/viewers/shared/PropertyTags.vue';
import { difference, isEqual } from 'lodash';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import nodeToString from '/imports/parser/toString';
import { ComputedClassSchema } from '/imports/api/properties/Classes';
import type { InferType } from '/imports/api/utility/TypedSimpleSchema';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  classId: string;
  creatureId?: string;
  dummySlot?: InferType<typeof ComputedClassSchema>;
}>();

const store = useStore(key);

provide('context', reactive({ creatureId: toRef(props, 'creatureId') }));

const selectedNodeIds = ref<string[]>([]);
const searchInput = ref<string | undefined>(undefined);
const searchValue = ref<string | undefined>(undefined);
const showDisabled = ref(false);
const currentLimit = ref(50);

const { result: classFillerSubReady } = autorun(() => {
  const handle = Meteor.subscribe('classFillers', props.classId, searchValue.value ?? undefined, currentLimit.value);
  return handle.ready();
});

const { result: model } = autorun(() => {
  return CreatureProperties.findOne(props.classId) as CreaturePropertyTypes['class'] ?? null;
});

const { result: variables } = autorun(() => {
  if (!props.creatureId) return {};
  return CreatureVariables.findOne({ _creatureId: props.creatureId }) || {};
});

const { result: alreadyAdded } = autorun(() => {
  const added = new Set<string>();
  const ancestorId = model.value?.root.id;
  if (!ancestorId) return added;
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(ancestorId),
    libraryNodeId: { $exists: true },
    removed: { $ne: true },
  }, {
    fields: { libraryNodeId: 1 },
  }).forEach((prop: any) => {
    added.add(prop.libraryNodeId);
  });
  return added;
});

const { result: totalQuantitySelected } = autorun(() => {
  let quantitySelected = 0;
  LibraryNodes.find({ _id: { $in: selectedNodeIds.value } }, {
    fields: { slotQuantityFilled: 1 },
  }).forEach((node: any) => {
    if (Number.isFinite(node.slotQuantityFilled)) {
      quantitySelected += node.slotQuantityFilled;
    } else {
      quantitySelected += 1;
    }
  });
  return quantitySelected;
});

const { result: libraryNames } = autorun(() => {
  const names: Record<string, string> = {};
  Libraries.find().forEach((lib: any) => { names[lib._id] = lib.name; });
  return names;
});

const { result: filledLevels } = autorun(() =>
  LibraryNodes.find({ _id: { $in: selectedNodeIds.value } })
    .map((node: any) => node.level || node.cache?.node?.level || 0)
    .sort((a: number, b: number) => a - b)
);

const { result: libraryNodesResult } = autorun(async () => {
  if (!classFillerSubReady.value) return { nodes: [], count: 0 };
  const nodes: any[] = LibraryNodes.find({ _classFillerResult: true }, {
    sort: { level: 1, name: 1, order: 1 },
  }).fetch();
  let count = 0;
  nodes.forEach(node => {
    if (node.cache?.node) node.level = node.cache.node.level;
    if (node.slotFillerCondition) {
      try {
        const parseNode = parse(node.slotFillerCondition);
        const { result: resultNode } = resolve('reduce', parseNode, variables.value);
        if (resultNode?.parseType === 'constant') {
          if (!resultNode.value) {
            node._disabledBySlotFillerCondition = true;
            node._conditionError = node.slotFillerConditionNote || node.slotFillerCondition;
            count += 1;
          }
        } else {
          node._disabledBySlotFillerCondition = true;
          node._conditionError = node.slotFillerConditionNote || nodeToString(resultNode);
          count += 1;
        }
      } catch (e) {
        console.warn(e);
        const error = prettifyParseError(e as Error);
        node._disabledBySlotFillerCondition = true;
        node._conditionError = 'Condition error: ' + error;
        count += 1;
      }
    }
    const quantityToFill = node.type === 'slotFiller' ? node.slotQuantityFilled : 1;
    if (quantityToFill > spaceLeft.value) {
      node._disabledByQuantityFilled = true;
    }
    if (alreadyAdded.value?.has(node._id)) {
      node._disabledByAlreadyAdded = true;
    }
  });
  nodes.sort((a, b) => a.level - b.level);
  return { nodes, count };
});

const libraryNodes = computed(() => libraryNodesResult.value?.nodes ?? []);
const disabledNodeCount = computed(() => libraryNodesResult.value?.count ?? 0);

const tagsSearched = computed(() => {
  const or: string[][] = [];
  const not: string[][] = [];
  if (model.value?.slotTags?.length) or.push(model.value.slotTags);
  model.value?.extraTags?.forEach((extras: any) => {
    if (extras.tags?.length) {
      if (extras.operation === 'OR') or.push(extras.tags);
      else if (extras.operation === 'NOT') not.push(extras.tags);
    }
  });
  return { or, not };
});

const hasMore = computed(() => libraryNodes.value.length >= currentLimit.value);
const searchLoading = computed(() => !!searchValue.value && !classFillerSubReady.value);
const activeCount = computed(() => libraryNodes.value.length - disabledNodeCount.value);

function isDisabled(node: any) {
  const selected = selectedNodeIds.value.includes(node._id);
  return node._disabledByAlreadyAdded
    || (node._disabledByQuantityFilled && !selected)
    || (filledLevels.value?.includes(node.level || node.cache?.node?.level || 0) && !selected);
}

watch(selectedNodeIds, (selectedIds, oldSelectedIds) => {
  if (oldSelectedIds.length < selectedIds.length) {
    const addedId = difference(selectedIds, oldSelectedIds)[0];
    if (!addedId) return;
    const addedNode: any = LibraryNodes.findOne(addedId);
    if (!addedNode) return;
    const backFilledLevels = new Set<number>();
    LibraryNodes.find({ _id: { $in: selectedIds } }).forEach((node: any) => {
      backFilledLevels.add(node.level || node.cache?.node?.level || 0);
    });
    libraryNodes.value.forEach((node: any) => {
      if (
        !selectedIds.includes(node._id)
        && (node.level < addedNode.level)
        && !backFilledLevels.has(node.level)
        && !isDisabled(node)
        && !node._disabledBySlotFillerCondition
      ) {
        selectedIds.push(node._id);
        backFilledLevels.add(node.level);
      }
    });
  }
  const sortedIds = LibraryNodes.find(
    { _id: { $in: selectedIds } },
    { sort: { level: 1, name: 1, order: 1 } }
  )
    .fetch()
    .sort((a: any, b: any) => (a.level || a.cache?.node?.level || 0) - (b.level || b.cache?.node?.level || 0))
    .map((node: any) => node._id);
  if (!isEqual(selectedNodeIds.value, sortedIds)) {
    selectedNodeIds.value = sortedIds;
  }
});

watch(activeCount, (val) => {
  if (!classFillerSubReady.value) return;
  if (hasMore.value && val < 20) loadMore();
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
</script>

<template lang="html">
  <dialog-base
    :color="model.color"
    dark-body
  >
    <template #toolbar>
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
      <property-tags
        v-for="(tags, index) in tagsSearched.or"
        :key="index"
        :tags="tags"
        :prefix="index ? 'OR' : undefined"
      />
      <property-tags
        v-for="(tags, index) in tagsSearched.not"
        :key="index"
        :tags="tags"
        prefix="NOT"
      />
    </p>
    <v-expansion-panels
      multiple
      variant="inset"
    >
      <template v-for="libraryNode in libraryNodes">
        <v-expansion-panel
          v-if="showDisabled || !libraryNode._disabledBySlotFillerCondition"
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
      </template>
    </v-expansion-panels>
    <div
      v-if="(!classFillerSubReady && !searchValue) || hasMore"
      class="d-flex flex-column align-center justify-center ma-3 mt-8"
    >
      <v-btn
        :loading="!classFillerSubReady"
        color="accent"
        variant="outlined"
        @click="loadMore"
      >
        Load More
      </v-btn>
    </div>
    <template v-if="!showDisabled && disabledNodeCount">
      <div class="d-flex flex-column align-center justify-center ma-3">
        <div>
          Requirements of {{ disabledNodeCount }} properties were not met
        </div>
        <v-btn
          class="mt-2"
          elevation="0"
          color="accent"
          @click="showDisabled = true"
        >
          Show All
        </v-btn>
      </div>
    </template>
    <template #actions>
      <v-btn
        variant="text"
        @click="store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :disabled="!dummySlot && !selectedNodeIds.length"
        @click="store.dispatch('popDialogStack', selectedNodeIds)"
      >
        <template v-if="model.spaceLeft">
          {{ totalQuantitySelected }} / {{ model.spaceLeft }}
        </template>
        <template v-if="classId">
          Insert
        </template>
        <template v-else>
          Close Test
        </template>
      </v-btn>
    </template>
  </dialog-base>
</template>

<style lang="css" scoped>
.disabled {
  opacity: 0.7;
}
</style>
