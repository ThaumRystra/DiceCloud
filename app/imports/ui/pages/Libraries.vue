<template lang="html">
  <toolbar-layout>
  	<span slot="toolbar">Libraries</span>
		<v-card class="ma-4">
			<v-list v-if="libraries.length">
				<v-list-tile
					v-for="library in libraries"
					:key="library._id"
					:to="`/library/${library._id}`"
					:data-id="library._id"
				>
					<v-list-tile-content>
						<v-list-tile-title>
							{{library.name}}
						</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
			<v-card-text v-else-if="$subReady.libraries">
				You aren't subscribed to any libraries :O
			</v-card-text>
			<v-card-text v-if="!$subReady.libraries" class="layout row justify-center">
				<v-progress-circular indeterminate/>
			</v-card-text>
		</v-card>
		<v-btn fixed fab bottom right
			color="primary"
			@click="insertLibrary"
			data-id="insert-library-fab"
		>
			<v-icon>add</v-icon>
		</v-btn>
  </toolbar-layout>
</template>

<script>
	import ToolbarLayout from '/imports/ui/layouts/ToolbarLayout.vue';
	import Libraries, {insertLibrary} from '/imports/api/library/Libraries.js';

	export default {
		components: {
			ToolbarLayout,
		},
		methods: {
			insertLibrary(){
				this.$store.commit('pushDialogStack', {
					component: 'library-creation-dialog',
					elementId: 'insert-library-fab',
					callback(library){
						if (!library) return;
						let libraryId = insertLibrary.call(library);
						return libraryId;
					}
				});
			},
		},
		meteor: {
			$subscribe: {
				'libraries': [],
			},
			libraries(){
				return Libraries.find({}, {
					sort: {name: 1}
				}).fetch();
			}
		}
	};
</script>

<style lang="css" scoped>
</style>
