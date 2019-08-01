<template lang="html">
	<draggable
		:value="children"
		class="drag-area"
		@change="change"
		:group="group"
		:animation="200"
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
				if (event){
					let newIndex = event.newIndex;
					let doc = event.element.node;
					if (moved){
						this.$emit('reordered', {doc, newIndex});
					} else if (added){
						this.$emit('reorganized', {doc, parent: this.node, newIndex});
					}
				}
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
