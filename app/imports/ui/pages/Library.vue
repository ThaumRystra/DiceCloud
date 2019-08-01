<template lang="html">
	<toolbar-layout>
		<template slot="toolbar">
			<v-btn icon flat to="/library" active-class="">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			{{library && library.name || 'Library'}}
			<v-spacer/>
			<v-btn-toggle>
				<v-btn v-model="organize">
					<v-icon class="mr-1">reorder</v-icon>
					Organize
				</v-btn>
			</v-btn-toggle>
		</template>
		<v-card class="ma-4 layout row">
			<library-contents-container
				:library-id="$route.params.id"
				:organize="organize"
				@selected="e => selected = e"
				:selected-node-id="selected"
			/>
			<v-divider vertical/>
			<v-card-text
			style="flex-grow: 1;"
			>
				<pre>{{selectedNode}}</pre>
			</v-card-text>
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
	import { setDocToLastOrder } from '/imports/api/parenting/order.js';

	export default {
		components: {
			ToolbarLayout,
			LibraryContentsContainer,
		},
		data(){ return {
			organize: false,
			selected: undefined,
		};},
		methods: {
			insertLibraryNode(){
				let that = this;
				this.$store.commit('pushDialogStack', {
					component: 'library-node-creation-dialog',
					elementId: 'insert-library-node-fab',
					callback(libraryNode){
						if (!libraryNode) return;
						libraryNode.parent = {collection: "libraries", id: that.library._id};
						libraryNode.ancestors = [ {collection: "libraries", id: that.library._id}];
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
			},
			selectedNode(){
				let node = LibraryNodes.findOne(this.selected);
				return JSON.stringify(node, null, 2);
			}
		}
	};
</script>
