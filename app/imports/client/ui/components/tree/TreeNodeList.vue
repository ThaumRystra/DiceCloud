<template lang="html">
  <!--use value for immutable, list for auto-updating children -->
  <VueDraggable
    v-model="displayedChildren"
    class="drag-area"
    :group="group"
    :animation="200"
    ghost-class="ghost"
    draggable=".item"
    handle=".handle"
    @update="onSorted"
    @add="onAdded"
  >
    <tree-node
      v-for="child in displayedChildren"
      :key="child.doc._id"
      class="item"
      :node="child.doc"
      :children="child.children"
      :group="group"
      :selected-node="selectedNode"
      :selected="selectedNode && selectedNode._id === child.doc._id"
      :ancestors-of-selected-node="ancestorsOfSelectedNode"
      :organize="organize"
      :lazy="lazy"
      :start-expanded="startExpanded"
      @selected="e => $emit('selected', e)"
      @move-within-root="e => $emit('move-within-root', e)"
      @move-between-roots="e => $emit('move-between-roots', e)"
    />
  </VueDraggable>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { type DraggableEvent, VueDraggable } from 'vue-draggable-plus';
import TreeNode from '/imports/client/ui/components/tree/TreeNode.vue';
import type { TreeNode as TreeNodeType } from '/imports/api/parenting/parentingFunctions';
import type { TreeDoc } from '/imports/api/parenting/ChildSchema';

const props = defineProps<{
  node?: TreeDoc;
  root: Record<string, any>;
  group?: string;
  organize?: boolean;
  lazy?: boolean;
  children?: TreeNodeType<TreeDoc>[];
  selectedNode?: TreeDoc;
  ancestorsOfSelectedNode?: TreeNodeType<TreeDoc>[];
  startExpanded?: boolean;
}>();

const emit = defineEmits<{
  selected: [id: string];
  'move-within-root': [e: unknown];
  'move-between-roots': [e: unknown];
}>();

const displayedChildren = ref<any[]>([]);

watch(() => props.children, (value) => {
  displayedChildren.value = value ?? [];
});

onMounted(() => {
  displayedChildren.value = props.children ?? [];
});

function onSorted(event: DraggableEvent<any>) {
  handleDrag(event.data, event.newIndex, event.oldIndex);
}

function onAdded(event: DraggableEvent<any>) {
  handleDrag(event.data, event.newIndex, undefined);
}

function handleDrag(element: any, newIndex: number | undefined, oldIndex: number | undefined) {
  if (newIndex === undefined) return;
  const doc = element.doc;
  let newPosition: number;
  const children = props.children ?? [];
  if (!children.length) {
    if (props.node) {
      newPosition = props.node.left + 0.5;
    } else {
      newPosition = 0.5;
    }
  } else if (newIndex < children.length) {
    const childAtNewIndex = children[newIndex];
    if (oldIndex !== undefined && newIndex > oldIndex) {
      newPosition = childAtNewIndex.doc.right + 0.5;
    } else {
      newPosition = childAtNewIndex.doc.left - 0.5;
    }
  } else {
    const childBeforeNewIndex = children[newIndex - 1];
    newPosition = childBeforeNewIndex.doc.right + 0.5;
  }
  if (doc.root.id === props.root.id) {
    emit('move-within-root', { doc, newPosition });
  } else {
    emit('move-between-roots', { doc, newPosition, newRootRef: props.root });
  }
}
</script>

<style lang="css" scoped>
.flip-list-leave-active {
  display: none;
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}
</style>
