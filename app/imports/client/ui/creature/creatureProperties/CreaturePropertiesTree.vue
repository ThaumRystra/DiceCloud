<template lang="html">
  <tree-node-list
    v-if="root"
    :children="children"
    :group="group"
    :organize="organize"
    :selected-node="selectedNode"
    :start-expanded="expanded"
    :root="root"
    @selected="e => $emit('selected', e)"
    @move-within-root="moveWithinRoot"
    @move-between-roots="moveBetweenRoots"
  />
</template>

<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import { filterToForest, getCollectionByName } from '/imports/api/parenting/parentingFunctions';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { moveBetweenRoots as moveBetweenRootsMethod, moveWithinRoot as moveWithinRootMethod } from '/imports/api/parenting/organizeMethods';

const props = defineProps<{
  root?: Record<string, any>;
  organize?: boolean;
  selectedNode?: Record<string, any>;
  filter?: Record<string, any>;
  group?: string;
  collection?: string;
  expanded?: boolean;
}>();

const emit = defineEmits<{
  (e: 'selected', v: any): void;
  (e: 'length', n: number): void;
}>();

const { result: children } = autorun(() => {
  const result = filterToForest?.(
    getCollectionByName(props.collection ?? 'creatureProperties'),
    props.root?.id,
    props.filter,
    {
      includeFilteredDocAncestors: true,
      includeFilteredDocDescendants: true,
    }
  ) || [];
  emit('length', result.length);
  return result;
});

function moveWithinRoot({ doc, newPosition }: any) {
  moveWithinRootMethod.callAsync({
    docRef: { id: doc._id, collection: props.collection ?? 'creatureProperties' },
    newPosition,
  });
}

function moveBetweenRoots({ doc, newPosition, newRootRef }: any) {
  moveBetweenRootsMethod.callAsync({
    docRef: { id: doc._id, collection: props.collection ?? 'creatureProperties' },
    newPosition,
    newRootRef,
  });
}
</script>

<style lang="css" scoped>

</style>
