<template lang="html">
  <v-sheet
    class="tree-node"
    :class="{
      'empty': !hasChildren,
      'found': node._matchedDocumentFilter,
    }"
    :data-id="`tree-node-${node._id}`"
  >
    <div
      class="d-flex align-center justify-start tree-node-title"
      style="cursor: pointer;"
      :class="selected && 'text-primary'"
      @click.stop="$emit('selected', node._id)"
    >
      <v-btn
        v-if="!startExpanded"
        size="small"
        icon
        :class="showExpanded ? 'rotate-90' : null"
        :disabled="!hasChildren && !organize || !canExpand"
        @click.stop="expanded = !expanded"
      >
        <v-icon v-if="canExpand && (hasChildren || organize)">
          mdi-chevron-right
        </v-icon>
      </v-btn>
      <div
        class="d-flex align-center justify-start pr-1"
        :class="{'ml-4': startExpanded}"
        style="flex-grow: 0;"
      >
        <drag-handle
          v-if="organize"
          class="mr-2"
          :class="selected && 'text-primary'"
          :disabled="expanded"
        />
        <tree-node-view
          :model="node"
          :selected="selected"
        />
      </div>
    </div>
    <v-expand-transition>
      <div
        v-show="showExpanded"
        class="pl-3"
      >
        <v-fade-transition hide-on-leave>
          <tree-node-list
            v-if="showExpanded"
            :node="node"
            :root="node.root"
            :children="computedChildren"
            :group="group"
            :organize="organize"
            :selected-node="selectedNode"
            :start-expanded="startExpanded"
            @move-within-root="e => $emit('move-within-root', e)"
            @move-between-roots="e => $emit('move-between-roots', e)"
            @selected="e => $emit('selected', e)"
          />
          <div v-else>
            <div
              v-for="i in children?.length"
              :key="i"
              class="dummy-node"
            />
          </div>
        </v-fade-transition>
      </div>
    </v-expand-transition>
  </v-sheet>
</template>

<script setup lang="ts">
/**
* TreeNode's are list item views of character properties. Every property which
* can belong to the character is shown in the tree view of the character
* the tree view shows off the full character structure, and where each part of
* character comes from.
**/
import { ref, computed, watch, defineAsyncComponent } from 'vue';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import { isAncestor } from '/imports/api/parenting/parentingFunctions';
import type { TreeNode as TreeNodeType } from '/imports/api/parenting/parentingFunctions';
import type { TreeDoc } from '/imports/api/parenting/ChildSchema';

const TreeNodeList = defineAsyncComponent(() => import('./TreeNodeList.vue'));

const props = defineProps<{
  node: TreeDoc & {
    _ancestorOfMatchedDocument?: boolean;
    _matchedDocumentFilter?: boolean;
  };
  group?: string;
  organize?: boolean;
  children?: TreeNodeType<TreeDoc>[];
  getChildren?: () => TreeNodeType<TreeDoc>[];
  selectedNode?: TreeDoc;
  selected?: boolean;
  startExpanded?: boolean;
}>();

const emit = defineEmits<{
  'move-within-root': [e: unknown];
  'move-between-roots': [e: unknown];
  selected: [id: string];
}>();

const expanded = ref(
  props.startExpanded ||
  props.node._ancestorOfMatchedDocument ||
  isAncestor(props.node, props.selectedNode)
);

const hasChildren = computed(() => {
  return (props.children && props.children.length > 0);
});

const showExpanded = computed(() => {
  return expanded.value && (props.organize || hasChildren.value);
});

const computedChildren = computed(() => {
  const children: any[] = [];
  if (props.children) {
    children.push(...props.children);
  }
  if (props.getChildren) {
    children.push(...props.getChildren());
  }
  return children;
});

const canExpand = computed(() => true);

watch(() => props.node._ancestorOfMatchedDocument, (value) => {
  expanded.value = !!value || isAncestor(props.node, props.selectedNode);
});

watch(() => props.selectedNode?.parentId, () => {
  expanded.value = isAncestor(props.node, props.selectedNode) || expanded.value;
});
</script>

<style lang="css" scoped>
.rotate-90 {
  transform: rotate(90deg) translateZ(0);
}

.drag-area {
  box-shadow: -2px 0px 0px 0px #808080;
  margin-left: 0;
  min-height: 32px;
}

.empty .drag-area {
  box-shadow: -2px 0px 0px 0px rgb(128, 128, 128, 0.4);
}

.empty .v-btn {
  opacity: 0.4;
}

.found {
  background: rgba(200, 0, 0, 0.1) !important;
}

.ghost {
  opacity: 0.5;
  background: rgba(251, 0, 0, 0.3);
}

.v-icon.v-icon--disabled {
  opacity: 0;
}

.v-icon {
  transition: none !important;
}

.v-theme--light .tree-node-title:hover {
  background-color: rgba(0, 0, 0, .04);
}

.v-theme--dark .tree-node-title:hover {
  background-color: rgba(255, 255, 255, .04);
}

.tree-node-title {
  transition: background ease 0.3s, color ease 0.15s;
}

.tree-node-title,
.dummy-node {
  min-height: 40px;
}
</style>
