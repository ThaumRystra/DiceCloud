<template lang="html">
	<toolbar-layout>
		<template slot="toolbar">
			<v-btn icon flat to="/library" active-class="">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			{{library && library.name || 'Library'}}
			<v-spacer/>
		</template>
		<v-card class="ma-4 layout row" data-id="library-card">
			<div>
				<v-toolbar dense flat>
					<v-spacer/>
					<v-switch
						label="Organize"
						class="mx-3"
						v-model="organize"
						style="flex-grow: 0; height: 32px;"
					/>
				</v-toolbar>
				<library-contents-container
					:library-id="$route.params.id"
					:organize="organize"
					@selected="e => selected = e"
					:selected-node-id="selected"
				/>
			</div>
			<v-divider vertical/>
			<div style="width: 100%; background-color: inherit;" data-id="selected-node-card">
				<v-toolbar dense flat>
					<property-icon :type="selectedNode && selectedNode.type" class="mr-2"/>
					<div class="title">
						{{getPropertyName(selectedNode && selectedNode.type)}}
					</div>
					<v-spacer/>
					<v-btn flat icon @click="editLibraryNode" v-if="selectedNode">
						<v-icon>create</v-icon>
					</v-btn>
				</v-toolbar>
				<v-card-text>
					<property-viewer :model="selectedNode"/>
				</v-card-text>
			</div>
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
	import PropertyViewer from '/imports/ui/properties/PropertyViewer.vue';
	import LibraryNodes, { insertNode } from '/imports/api/library/LibraryNodes.js';
	import Libraries from '/imports/api/library/Libraries.js';
	import { setDocToLastOrder } from '/imports/api/parenting/order.js';
	import PropertyIcon from '/imports/ui/components/properties/PropertyIcon.vue';
	import { getPropertyName } from '/imports/constants/PROPERTIES.js';

	export default {
		components: {
			ToolbarLayout,
			LibraryContentsContainer,
			PropertyViewer,
			PropertyIcon,
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
						let libraryNodeId = insertNode.call(libraryNode);
						return libraryNodeId;
					}
				});
			},
			editLibraryNode(){
				let that = this;
				this.$store.commit('pushDialogStack', {
					component: 'library-node-edit-dialog',
					elementId: 'selected-node-card',
					data: {_id: this.selected},
				});
			},
			getPropertyName,
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
				return LibraryNodes.findOne(this.selected);
			}
		}
	};
</script>
