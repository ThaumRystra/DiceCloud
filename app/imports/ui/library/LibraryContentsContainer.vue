<template lang="html">
	<v-card-text>
		<tree-node-list
			v-if="libraryChildren"
			:children="libraryChildren"
			:group="library && library._id"
			:organize="organize"
			@reordered="reordered"
			@reorganized="reorganized"
		/>
	</v-card-text>
</template>

<script>
	import Libraries from '/imports/api/library/Libraries.js';
	import LibraryNodes, { libraryNodesToTree } from '/imports/api/library/LibraryNodes.js';
	import TreeNodeList from '/imports/ui/components/tree/TreeNodeList.vue';
	import { organizeDoc, reorderDoc } from '/imports/api/parenting/organizeMethods.js';

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
			reordered({doc, newIndex}){
				reorderDoc.call({
					docRef: {
						id: doc._id,
						collection: 'libraryNodes',
					},
					order: newIndex,
				});
			},
			reorganized({doc, parent, newIndex}){
				let parentRef;
				if (parent){
					parentRef = {
						id: parent._id,
						collection: 'libraryNodes',
					};
				} else {
					parentRef = {
						id: this.libraryId,
						collection: 'libraries',
					};
				}
				organizeDoc.call({
					docRef: {
						id: doc._id,
						collection: 'libraryNodes',
					},
					parentRef,
					order: newIndex,
				});
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
