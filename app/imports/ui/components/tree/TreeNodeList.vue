<template lang="html">
	<draggable
		:list="children"
		class="drag-area layout column"
		:group="group"
		:animation="200"
		ghost-class="ghost"
		draggable=".item"
	>
		<tree-node
			v-for="child in children"
			v-bind="child"
			:group="group"
			:key="child.name"
			:showEmpty="showEmpty"
			class="item"
			@dragstart.native="e => e.dataTransfer.setData('cow', child.name)"
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
			group: String,
			showEmpty: Boolean,
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
				return this.expanded && (this.showEmpty || this.hasChildren)
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
