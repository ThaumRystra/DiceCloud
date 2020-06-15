<template lang="html">
  <v-sheet
    class="tree-node"
    :class="!hasChildren ? 'empty' : null"
    :data-id="`tree-node-${node._id}`"
  >
    <div
      class="layout row align-center justify-start tree-node-title"
      style="cursor: pointer;"
      :class="selected && 'primary--text'"
      @click.stop="$emit('selected', node._id)"
    >
      <v-btn
        small
        icon
        :class="showExpanded ? 'rotate-90' : null"
        :disabled="!hasChildren && !organize || !canExpand"
        @click.stop="expanded = !expanded"
      >
        <v-icon v-if="canExpand && (hasChildren || organize)">
          chevron_right
        </v-icon>
      </v-btn>
      <div
        class="layout row align-center justify-start pr-1"
        style="flex-grow: 0;"
      >
        <v-icon
          v-if="organize"
          class="handle mr-2"
          :class="selected && 'primary--text'"
          :disabled="expanded"
        >
          drag_handle
        </v-icon>
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
            :selected-node-id="selectedNodeId"
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

<script>
	/**
	* TreeNode's are list item views of character properties. Every property which
	* can belong to the character is shown in the tree view of the character
	* the tree view shows off the full character structure, and where each part of
	* character comes from.
	**/
	import { canBeParent } from '/imports/api/parenting/parenting.js';
	import { getPropertyIcon } from '/imports/constants/PROPERTIES.js';
  import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';

	export default {
		name: 'TreeNode',
    components: {
      TreeNodeView,
    },
		props: {
			node: Object,
			group: String,
			organize: Boolean,
			children: Array,
			getChildren: Function,
			selectedNodeId: String,
			selected: Boolean,
		},
		data(){ return {
			expanded: false,
		}},
		computed: {
			hasChildren(){
				return this.children && this.children.length || this.lazy && !this.expanded;
			},
			showExpanded(){
				return this.expanded && (this.organize || this.hasChildren)
			},
			computedChildren(){
				let children = [];
				if (this.children){
					children.push(...this.children)
				}
				if (this.getChildren){
					children.push(...this.getChildren())
				}
				return children;
			},
			canExpand(){
				return canBeParent(this.node.type);
			},
		},
		beforeCreate() {
      this.$options.components.TreeNodeList = require('./TreeNodeList.vue').default
		},
		methods: {
			icon(type){
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
	.handle {
		cursor: move;
	}
	.empty .drag-area {
		box-shadow: -2px 0px 0px 0px rgb(128, 128, 128, 0.4);
	}
	.empty .v-btn {
		opacity: 0.4;
	}
	.ghost {
    opacity: 0.5;
    background: #fbc8c8;
	}
	.v-icon.v-icon--disabled {
		opacity: 0;
	}
  .v-icon {
    transition: none !important;
  }
	.theme--light .tree-node-title:hover {
		background: rgba(0,0,0,.04);
	}
  .dummy-node {
    height: 40px;
  }
</style>
