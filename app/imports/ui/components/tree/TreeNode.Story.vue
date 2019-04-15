<template lang="html">
	<div>
		<tree-node v-bind="node" group="cheese"/>
		<samp>
			{{dataString}}
		</samp>
		<div style="height: 200px" @drop="e => log(e.dataTransfer.getData('cow'))" @dragover.prevent></div>
	</div>
</template>

<script>
	import TreeNode from '/imports/ui/components/tree/TreeNode.vue';

	export default {
		components: {
			TreeNode,
		},
		data(){ return {
			node: {
				name: 'parent',
				children: [
					{name: 'child 1', children:[]},
					{name: 'child 2', children: [
						{name: 'grandchild 1', children:[]},
						{name: 'grandchild 2', children:[]},
					]},
					{name: 'child 3', children:[]},
				],
			},
			drag: false,
		}},
		computed: {
			dataString(){
				return JSON.stringify(this.node, null, 2);
			}
		},
		methods: {
			log: console.log,
		},
	};
</script>

<style lang="css" scoped>
</style>
