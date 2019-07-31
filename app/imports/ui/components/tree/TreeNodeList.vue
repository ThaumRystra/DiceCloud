<template lang="html">
	<draggable
		:value="children"
		class="drag-area layout column"
		@change="change"
		@start="start"
		:group="group"
		:animation="200"
		ghost-class="ghost"
		draggable=".item"
		handle=".handle"
	>
		<tree-node
			v-for="child in children"
			:node="child.node"
			:children="child.children"
			:group="group"
			:key="child.node && (child.node._id || child.node.name)"
			:organize="organize"
			:lazy="lazy"
			class="item"
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
			start(){
				console.log({start: arguments})
			}
		},
	};
</script>

<style lang="css" scoped>
</style>
