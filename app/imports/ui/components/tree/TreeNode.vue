<template lang="html">
	<div :class="!hasChildren ? 'empty' : null">
		<div class="layout row align-center">
			<v-btn
				small icon
				:class="showExpanded ? 'rotate-90' : null"
				@click="expanded = !expanded"
				:disabled="!hasChildren && !organize"
			>
				<v-icon v-if="hasChildren || organize">chevron_right</v-icon>
			</v-btn>
			<v-icon class="handle mr-2" v-if="organize">reorder</v-icon>
			<div>
				<span class="mr-2 subheading">{{node && node.order}}</span>
				{{node && node.name}}
			</div>
		</div>
		<v-expand-transition>
			<div v-if="showExpanded">
				<tree-node-list
					:node="node"
					:children="computedChildren"
					:group="group"
					:show-empty="organize"
					@moved="e => $emit('moved', e)"
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
			}
		},
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
</style>
