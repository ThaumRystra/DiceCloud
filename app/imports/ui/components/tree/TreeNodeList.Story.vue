<template lang="html">
	<div>
		<tree-node-list :children="children" group="example-group" :show-empty="true"/>
		<samp>
			{{dataString}}
		</samp>
		<div style="height: 200px" @drop="e => log(e.dataTransfer.getData('cow'))" @dragover.prevent></div>
		<tree-node-list :children="otherChildren" group="example-group" :show-empty="true"/>
	</div>
</template>

<script>
	import TreeNodeList from '/imports/ui/components/tree/TreeNodeList.vue';

	export default {
		components: {
			TreeNodeList,
		},
		data(){ return {
			children: [
				{name: 'child 1', children:[]},
				{name: 'child 2', children: [
					{name: 'grandchild 1', children:[]},
					{name: 'grandchild 2', children:[]},
				]},
				{name: 'child 3', children:[]},
			],
			otherChildren: [],
			drag: false,
		}},
		computed: {
			dataString(){
				return JSON.stringify(this.children, null, 2);
			}
		},
		methods: {
			log: console.log,
		},
	};
</script>

<style lang="css" scoped>
</style>
