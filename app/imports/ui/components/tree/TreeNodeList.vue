<template lang="html">
  <!--use value for immutable, list for auto-updating children -->
  <draggable
    class="drag-area"
    :value="children"
    :group="group"
    :animation="200"
    :move="move"
    ghost-class="ghost"
    draggable=".item"
    handle=".handle"
    @change="change"
  >
    <tree-node
      v-for="child in children"
      :key="child.node._id"
      class="item"
      :node="child.node"
      :children="child.children"
      :group="group"
      :selected-node-id="selectedNodeId"
      :selected="selectedNodeId === child.node._id"
      :organize="organize"
      :lazy="lazy"
      @selected="e => $emit('selected', e)"
      @reordered="e => $emit('reordered', e)"
      @reorganized="e => $emit('reorganized', e)"
      @dragstart.native="e => e.dataTransfer.setData('cow', child.node && child.node.name)"
    />
  </draggable>
</template>

<script>
	import draggable from 'vuedraggable';
	import TreeNode from '/imports/ui/components/tree/TreeNode.vue';
	import { isParentAllowed } from '/imports/api/parenting/parenting.js';

	export default {
		components: {
			draggable,
			TreeNode,
		},
		props: {
			node: Object,
			group: String,
			organize: Boolean,
			lazy: Boolean,
			children: {
				type: Array,
				default: () => [],
			},
			selectedNodeId: String,
		},
		data(){ return {
			expanded: false,
		}},
		computed: {
			hasChildren(){
				return this.children && this.children.length;
			},
			showExpanded(){
				return this.expanded && (this.organize || this.hasChildren)
			},
		},
		methods: {
			change({added, moved}){
				let event = moved || added;
				if (event){
					let doc = event.element.node;
					let newIndex;
					if (event.newIndex === 0){
						newIndex = 0;
					} else {
						let childBeforeNewIndex = this.children[event.newIndex - 1];
						newIndex = childBeforeNewIndex.node.order + 1;
					}
					if (moved){
						this.$emit('reordered', {doc, newIndex});
					} else if (added){
						this.$emit('reorganized', {doc, parent: this.node, newIndex});
					}
				}
			},
			move(evt){
				let parentNode = evt.relatedContext.component.$parent.node
				let parentType = parentNode && parentNode.type || 'root';
				let childType = evt.draggedContext.element.node.type;
				let allowed = isParentAllowed({parentType, childType});
				return allowed;
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
