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
				small icon
				:class="showExpanded ? 'rotate-90' : null"
				@click.stop="expanded = !expanded"
				:disabled="!hasChildren && !organize || !canExpand"
			>
				<v-icon v-if="canExpand && (hasChildren || organize)">chevron_right</v-icon>
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
				<property-icon
					v-if="node.type"
					class="mr-2"
					:type="node.type"
					:class="selected && 'primary--text'"
				/>
				<div class="text-no-wrap text-truncate">
					<!--{{node && node.order}}-->
					{{getTitle}}
				</div>
			</div>
		</div>
		<v-expand-transition>
			<div v-if="showExpanded" class="pl-3">
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
	import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
	import { canBeParent } from '/imports/api/parenting/parenting.js';
	import PROPERTIES from '/imports/constants/PROPERTIES.js'

	export default {
		name: 'tree-node',
		beforeCreate() {
		  this.$options.components.TreeNodeList = require('./TreeNodeList.vue').default
		},
		components: {
			PropertyIcon,
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
			canExpand(){
				return canBeParent(this.node.type);
			},
			getTitle(){
				let node = this.node;
				if (!node) return;
				if (node.name) return node.name;
				let prop = PROPERTIES[this.node.type]
				return prop && prop.name;
			}
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
	  background: #c8ebfb;
	}
	.v-icon.v-icon--disabled {
		opacity: 0;
	}
	.theme--light .tree-node-title:hover {
		background: rgba(0,0,0,.04);
	}
</style>
