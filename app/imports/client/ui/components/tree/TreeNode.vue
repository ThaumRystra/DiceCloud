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
      class="layout align-center justify-start tree-node-title"
      style="cursor: pointer;"
      :class="selected && 'primary--text'"
      @click.stop="$emit('selected', node._id)"
    >
      <v-btn
        v-if="!startExpanded"
        small
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
        class="layout align-center justify-start pr-1"
        :class="{'ml-4': startExpanded}"
        style="flex-grow: 0;"
      >
        <drag-handle
          v-if="organize"
          class="mr-2"
          :class="selected && 'primary--text'"
          :disabled="expanded"
        />
        <!--{{node && node.order}}-->
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
            :children="computedChildren"
            :group="group"
            :organize="organize"
            :selected-node="selectedNode"
            :start-expanded="startExpanded"
            @reordered="e => $emit('reordered', e)"
            @reorganized="e => $emit('reorganized', e)"
            @selected="e => $emit('selected', e)"
          />
          <div v-else>
            <div
              v-for="i in children.length"
              :key="i"
              class="dummy-node"
            />
          </div>
        </v-fade-transition>
      </div>
    </v-expand-transition>
  </v-sheet>
</template>

<script lang="js">
/**
* TreeNode's are list item views of character properties. Every property which
* can belong to the character is shown in the tree view of the character
* the tree view shows off the full character structure, and where each part of
* character comes from.
**/
import { canBeParent } from '/imports/api/parenting/parenting.js';
import { getPropertyIcon } from '/imports/constants/PROPERTIES.js';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import { some } from 'lodash';

export default {
  name: 'TreeNode',
  components: {
    TreeNodeView,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    group: {
      type: String,
      default: undefined,
    },
    organize: Boolean,
    children: {
      type: Array,
      default: () => [],
    },
    getChildren: {
      type: Function,
      default: undefined,
    },
    selectedNode: {
      type: Object,
      default: undefined,
    },
    selected: Boolean,
    startExpanded: Boolean,
  },
  data() {
    return {
      expanded: this.startExpanded || this.node._ancestorOfMatchedDocument ||
        some(this.selectedNode?.ancestors, ref => ref.id === this.node._id) ||
        false,
    }
  },
  computed: {
    hasChildren() {
      return this.children && !!this.children.length || this.lazy && !this.expanded;
    },
    showExpanded() {
      return this.expanded && (this.organize || this.hasChildren)
    },
    computedChildren() {
      let children = [];
      if (this.children) {
        children.push(...this.children)
      }
      if (this.getChildren) {
        children.push(...this.getChildren())
      }
      return children;
    },
    canExpand() {
      return canBeParent(this.node.type);
    },
  },
  watch: {
    'node._ancestorOfMatchedDocument'(value) {
      this.expanded = !!value ||
        some(this.selectedNode?.ancestors, ref => ref.id === this.node._id);
    },
    'selectedNode.ancestors'(value) {
      this.expanded = !!some(value, ref => ref.id === this.node._id) || this.expanded;
    },
  },
  beforeCreate() {
    this.$options.components.TreeNodeList = require('./TreeNodeList.vue').default
  },
  methods: {
    icon(type) {
      return getPropertyIcon(type);
    },
  }
};
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

.theme--light .tree-node-title:hover {
  background-color: rgba(0, 0, 0, .04);
}

.theme--dark .tree-node-title:hover {
  background-color: rgba(255, 255, 255, .04);
}

.tree-node-title {
  transition: background ease 0.3s, color ease 0.15s;
}

.tree-node-title,
.dummy-node {
  height: 40px;
}
</style>
