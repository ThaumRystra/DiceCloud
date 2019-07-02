<template lang="html">
	<toolbar-layout>
		<span slot="toolbar">Library</span>
		<v-card class="ma-4">
			<library-contents-container
				:library-id="$route.params.id"
			/>
		</v-card>
		<v-btn fixed fab bottom right
			color="primary"
			@click="insertLibraryNode"
			data-id="insert-library-node-fab"
		>
			<v-icon>add</v-icon>
		</v-btn>
	</toolbar-layout>
</template>

<script>
	import ToolbarLayout from '/imports/ui/layouts/ToolbarLayout.vue';
	import LibraryContentsContainer from '/imports/ui/library/LibraryContentsContainer.vue';
	import {insertNode} from '/imports/api/library/LibraryNodes.js';

	export default {
		components: {
			ToolbarLayout,
			LibraryContentsContainer,
		},
		methods: {
			insertLibraryNode(){
				this.$store.commit('pushDialogStack', {
					component: 'library-node-creation-dialog',
					elementId: 'insert-library-node-fab',
					callback(libraryNode){
						if (!libraryNode) return;
						console.log({libraryNode});
						throw "TODO: give this library node ancestry before inserting it"
						let libraryNodeId = insertNode.call(libraryNode);
						return libraryNodeId;
					}
				});
			},
		},
	};
</script>
