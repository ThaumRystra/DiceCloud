<template lang="html">
	<div
		class="tree-node"
		:class="!hasChildren ? 'empty' : null"
		:data-id="node._id"
	>
		<div
			class="layout row align-center justify-start tree-node-title"
			style="cursor: pointer;"
			:class="selected && 'primary--text'"
			@click.stop="$emit('selected', node._id)"
		>
			<v-btn
				small icon
				:class="showExpanded ? 'rotate-90' : null"
				@click.stop="expanded = !expanded"
				:disabled="!hasChildren && !organize"
			>
				<v-icon v-if="hasChildren || organize">chevron_right</v-icon>
			</v-btn>
			<div
				class="layout row align-center justify-start"
				style="flex-grow: 0;"
			>
				<v-icon
					class="handle mr-2"
					v-if="organize"
					:class="selected && 'primary--text'"
					:disabled="expanded"
				>drag_handle</v-icon>
				<v-icon
					v-if="node.type"
					class="mr-2"
					:class="selected && 'primary--text'"
				>{{icon(node.type)}}</v-icon>
				<div class="text-no-wrap text-truncate">
					{{node && node.name}}
				</div>
			</div>
		</div>
		<v-expand-transition>
			<div v-if="showExpanded">
				<tree-node-list
					:node="node"
					:children="computedChildren"
					:group="group"
					:organize="organize"
					:selected-node-id="selectedNodeId"
					@reordered="e => $emit('reordered', e)"
					@reorganized="e => $emit('reorganized', e)"
					@selected="e => $emit('selected', e)"
				/>
			</div>
		</v-expand-transition>
	</div>
</template>

<script>
	/**
	* TreeNode's are list item views of character properties. Every property which
	* can belong to the character is shown in the tree view of the character
	* the tree view shows off the full character structure, and where each part of
	* character comes from.
	**/
	import PROPERTY_ICONS from '/imports/constants/PROPERTY_ICONS.js';
	export default {
		name: 'tree-node',
		beforeCreate() {
		  this.$options.components.TreeNodeList = require('./TreeNodeList.vue').default
		},
		data(){ return {
			expanded: false,
		}},
		props: {
			node: Object,
			group: String,
			organize: Boolean,
			children: Array,
			getChildren: Function,
			selectedNodeId: String,
			selected: Boolean,
		},
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
		},
		methods: {
			icon(type){
				return PROPERTY_ICONS[type];
			},
		}
	};
</script>

<style lang="css" scoped>
	.rotate-90 {
		transform: rotate(90deg);
	}
	.drag-area {
		min-height: 40px;
		box-shadow: -2px 0px 0px 0px #808080;
		margin-left: 23px;
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
	  background: #c8ebfb;
	}
	.v-icon.v-icon--disabled {
		opacity: 0;
	}
	.theme--light .tree-node-title:hover {
		background: rgba(0,0,0,.04);
	}
</style>
