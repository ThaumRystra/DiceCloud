<template lang="html">
	<draggable
		class="drag-area"
		:value="children"
		:group="group"
		:animation="200"
		:move="move"
		@change="change"
		ghost-class="ghost"
		draggable=".item"
		handle=".handle"
	>
		<tree-node
			class="item"
			v-for="child in children"
			:node="child.node"
			:children="child.children"
			:group="group"
			:key="child.node._id"
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
		data(){ return {
			expanded: false,
		}},
		props: {
			node: Object,
			group: String,
			organize: Boolean,
			lazy: Boolean,
			children: {
				type: Array,
				required: true,
			},
			selectedNodeId: String,
		},
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
				let newIndex = this.children[event.newIndex].node.order;
				if (event){
					let doc = event.element.node;
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
