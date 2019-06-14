<template lang="html">
	<v-card-text>
		<tree-node-list v-if="libraryChildren" :children="libraryChildren" :group="library && library._id"/>
		<template v-else>This library is empty</template>
	</v-card-text>
</template>

<script>
	import Libraries from '/imports/api/library/Libraries.js';
	import LibraryNodes from '/imports/api/library/LibraryNodes.js';
	import TreeNodeList from '/imports/ui/components/tree/TreeNodeList.vue';

	export default {
		components: {
			TreeNodeList,
		},
		props: {
			libraryId: String,
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
				return LibraryNodes.find({
					"parent.id": this.library._id
				}, {
					sort: {order: 1},
				});
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
