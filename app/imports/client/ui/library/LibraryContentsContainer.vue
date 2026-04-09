<template lang="html">
  <v-fade-transition hide-on-leave>
    <tree-node-list
      v-if="slowShouldSubscribe && $subReady.libraryNodes"
      group="library"
      :children="libraryChildren"
      :organize="organizeMode"
      :selected-node="selectedNode"
      :root="{collection: 'libraries', id: libraryId}"
      @selected="e => $emit('selected', e)"
      @move-within-root="moveWithinRoot"
      @move-between-roots="moveBetweenRoots"
    />
    <div
      v-else
      class="d-flex align-center justify-center"
      style="width: 100%;"
    >
      <v-progress-circular
        color="primary"
        :indeterminate="slowShouldSubscribe"
      />
    </div>
  </v-fade-transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import Libraries from '/imports/api/library/Libraries';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { filterToForest } from '/imports/api/parenting/parentingFunctions';
import { moveBetweenRoots as moveBetweenRootsMethod, moveWithinRoot as moveWithinRootMethod } from '/imports/api/parenting/organizeMethods';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';

const props = defineProps<{
  libraryId?: string;
  organizeMode?: boolean;
  selectedNode?: Record<string, any>;
  shouldSubscribe?: boolean;
  filter?: Record<string, any>;
  extraFields?: any[];
}>();

const slowShouldSubscribe = ref(props.shouldSubscribe ?? false);
let timeoutId: ReturnType<typeof setTimeout> | undefined;

watch(() => props.shouldSubscribe, (newValue) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  }
  if (newValue) {
    slowShouldSubscribe.value = newValue;
  } else {
    timeoutId = setTimeout(() => {
      slowShouldSubscribe.value = newValue ?? false;
    }, 2000);
  }
});

autorun(() => {
  if (slowShouldSubscribe.value) {
    Meteor.subscribe('libraryNodes', props.libraryId, props.extraFields);
  }
});

const { result: library } = autorun(() => Libraries.findOne(props.libraryId));

const { result: libraryChildren } = autorun(() => {
  if (!library.value) return;
  return filterToForest(
    LibraryNodes,
    props.libraryId,
    props.filter,
    {
      includeFilteredDocAncestors: true,
      includeFilteredDocDescendants: true,
    }
  );
});

function moveWithinRoot({ doc, newPosition }: any) {
  moveWithinRootMethod.callAsync({
    docRef: { id: doc._id, collection: 'libraryNodes' },
    newPosition,
  });
}

function moveBetweenRoots({ doc, newPosition, newRootRef }: any) {
  moveBetweenRootsMethod.callAsync({
    docRef: { id: doc._id, collection: 'libraryNodes' },
    newPosition,
    newRootRef,
  });
}
</script>

<style lang="css" scoped>

</style>
