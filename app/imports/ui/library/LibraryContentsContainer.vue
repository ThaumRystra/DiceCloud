<template lang="html">
	<v-card-text>
		<tree-node-list
			v-if="libraryChildren"
			:children="libraryChildren"
			:group="library && library._id"
			:organize="organize"
			@moved="moved"
		/>
	</v-card-text>
</template>

<script>
	import Libraries from '/imports/api/library/Libraries.js';
	import LibraryNodes, { libraryNodesToTree } from '/imports/api/library/LibraryNodes.js';
	import TreeNodeList from '/imports/ui/components/tree/TreeNodeList.vue';

	export default {
		components: {
			TreeNodeList,
		},
		props: {
			libraryId: String,
			organize: Boolean,
		},
		meteor: {
			$subscribe: {
				'library': [this.libraryId],
			},
			library(){
				return Libraries.findOne(this.libraryId);
			},
			libraryChildren(){
				if (!this.library) return;
				return libraryNodesToTree(this.library._id);
			},
		},
		methods: {
			moved(e){
				console.log(e)
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
