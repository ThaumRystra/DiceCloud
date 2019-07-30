<template lang="html">
	<toolbar-layout>
		<template slot="toolbar">
			{{library && library.name || 'Library'}}
			<v-spacer/>
			<v-switch v-model="organize" label="Sort" style="flex-grow: 0;"/>
		</template>
		<v-card class="ma-4">
			<library-contents-container
				:library-id="$route.params.id"
				:organize="organize"
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
	import LibraryNodes, { insertNode } from '/imports/api/library/LibraryNodes.js';
	import Libraries from '/imports/api/library/Libraries.js';
	import { setDocToLastOrder } from '/imports/api/order/order.js';

	export default {
		components: {
			ToolbarLayout,
			LibraryContentsContainer,
		},
		data(){ return {
			organize: false,
		};},
		methods: {
			insertLibraryNode(){
				let that = this;
				this.$store.commit('pushDialogStack', {
					component: 'library-node-creation-dialog',
					elementId: 'insert-library-node-fab',
					callback(libraryNode){
						if (!libraryNode) return;
						libraryNode.parent = {collection: "library", id: that.library._id};
						libraryNode.ancestors = [ {collection: "library", id: that.library._id}];
						setDocToLastOrder({collection: LibraryNodes, doc: libraryNode});
						console.log(libraryNode);
						let libraryNodeId = insertNode.call(libraryNode);
						return libraryNodeId;
					}
				});
			},
		},
		meteor: {
			$subscribe: {
				library(){
					return [this.$route.params.id];
				},
			},
			library(){
				return Libraries.findOne(this.$route.params.id);
			}
		}
	};
</script>
