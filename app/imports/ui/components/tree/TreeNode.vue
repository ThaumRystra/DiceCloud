<template lang="html">
	<div :class="!hasChildren ? 'empty' : null">
		<div class="layout row align-center">
			<v-btn
				small icon
				:class="showExpanded ? 'rotate-90' : null"
				@click="expanded = !expanded"
				:disabled="!hasChildren && !showEmpty"
			>
				<v-icon v-if="hasChildren || showEmpty">chevron_right</v-icon>
			</v-btn>
			<div>{{name}}</div>
		</div>
		<v-expand-transition>
			<div v-if="showExpanded">
				<tree-node-list
					:children="children"
					:group="group"
					:show-empty="showEmpty"
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
	import draggable from 'vuedraggable';
	export default {
		name: 'tree-node',
		components: {
			draggable,
		},
		beforeCreate() {
		  this.$options.components.TreeNodeList = require('./TreeNodeList.vue').default
		},
		data(){ return {
			expanded: false,
		}},
		props: {
			name: String,
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
	.rotate-90 {
		transform: rotate(90deg);
	}
	.drag-area {
		min-height: 40px;
		box-shadow: -2px 0px 0px 0px #808080;
		margin-left: 23px;
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
