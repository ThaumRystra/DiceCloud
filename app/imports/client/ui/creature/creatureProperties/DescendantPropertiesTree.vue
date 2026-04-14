<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import { docsToForest, getFilter } from '/imports/api/parenting/parentingFunctions';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { moveBetweenRoots as moveBetweenRootsMethod, moveWithinRoot as moveWithinRootMethod } from '/imports/api/parenting/organizeMethods';
import { getCollectionByName } from '/imports/api/parenting/parentingFunctions';

const props = defineProps<{
  model?: Record<string, any>;
  organize?: boolean;
  group?: string;
  collection?: string;
  expanded?: boolean;
}>();

const emit = defineEmits<{
  (e: 'selected', v: any): void;
  (e: 'length', n: number): void;
}>();

const { result: children } = autorun(() => {
  if (!props.model?.root) return [];
  const collection = getCollectionByName(props.collection ?? 'creatureProperties');
  const docs = collection.find({
    removed: { $ne: true },
    ...getFilter.descendants(props.model),
  }, { sort: { left: 1 } }).fetch();
  emit('length', docs.length);
  return docsToForest(docs);
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

<template lang="html">
  <tree-node-list
    v-if="model && model.root"
    :children="children"
    :group="group"
    :organize="organize"
    :start-expanded="expanded"
    :root="model.root"
    @selected="e => $emit('selected', e)"
    @move-within-root="moveWithinRoot"
    @move-between-roots="moveBetweenRoots"
  />
</template>
