<template lang="html">
	<div
		style="
			background-color: inherit;
			overflow-y: auto;
			width: initial;
			max-width: 100%;
			min-width: 320px;
		"
	>
		<v-expansion-panel
			style="box-shadow: none;"
			v-model="expandedLibrary"
		>
			<v-expansion-panel-content
				lazy
				v-for="library in libraries"
				:key="library._id"
				:data-id="library._id"
			>
				<template v-slot:header>
					<div class="title">{{library.name}}</div>
				</template>
				<v-card flat>
					<library-contents-container
						:library-id="library._id"
						:organize-mode="organizeMode"
						:edit-mode="editMode"
						@selected="e => $emit('selected', e)"
						:selected-node-id="selectedNodeId"
					/>
					<v-card-actions>
						<v-spacer/>
						<v-btn
							flat
							color="primary"
							style="background-color: inherit; margin-top: 0;"
							@click="insertLibraryNode(library._id)"
							:data-id="`insert-node-${library._id}`"
						>
							<v-icon>add</v-icon>
							New property
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-expansion-panel-content>
		</v-expansion-panel>
		<v-btn
			v-show="expandedLibrary === null"
			v-if="editMode"
			flat
			color="primary"
			style="background-color: inherit;"
			@click="insertLibrary"
			data-id="insert-library-button"
		>
			<v-icon>add</v-icon>
			New library
		</v-btn>
	</div>
</template>

<script>
import LibraryContentsContainer from '/imports/ui/library/LibraryContentsContainer.vue';
import { setDocToLastOrder } from '/imports/api/parenting/order.js';
import LibraryNodes, { insertNode } from '/imports/api/library/LibraryNodes.js';
import Libraries, { insertLibrary } from '/imports/api/library/Libraries.js';

export default {
	components: {
		LibraryContentsContainer,
	},
	props: {
		organizeMode: Boolean,
		editMode: Boolean,
		selectedNodeId: String,
	},
	data(){ return {
		expandedLibrary: null,
	};},
	meteor: {
		$subscribe: {
			'libraries': [],
		},
		libraries(){
			return Libraries.find({}, {
				sort: {name: 1}
			}).fetch();
		},
	},
	methods: {
		insertLibrary(){
			this.$store.commit('pushDialogStack', {
				component: 'library-creation-dialog',
				elementId: 'insert-library-button',
				callback(library){
					if (!library) return;
					let libraryId = insertLibrary.call(library);
					return libraryId;
				}
			});
		},
		insertLibraryNode(libraryId){
			this.$store.commit('pushDialogStack', {
				component: 'library-node-creation-dialog',
				elementId: `insert-node-${libraryId}`,
				callback(libraryNode){
					if (!libraryNode) return;
					libraryNode.parent = {collection: "libraries", id: libraryId};
					libraryNode.ancestors = [ {collection: "libraries", id: libraryId}];
					setDocToLastOrder({collection: LibraryNodes, doc: libraryNode});
					let libraryNodeId = insertNode.call(libraryNode);
					return libraryNodeId;
				}
			});
		},
	}
}
</script>

<style lang="css" scoped>
</style>
