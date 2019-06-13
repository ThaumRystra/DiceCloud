<template lang="html">
	<toolbar-layout>
		<span slot="toolbar">Library</span>
		<v-card class="ma-4">
			<library-contents-container
				:library-id="$route.params.id"
			/>
		</v-card>
	</toolbar-layout>
</template>

<script>
	import ToolbarLayout from '/imports/ui/layouts/ToolbarLayout.vue';
	import LibraryContentsContainer from '/imports/ui/library/LibraryContentsContainer.vue';

	export default {
		components: {
			ToolbarLayout,
			LibraryContentsContainer,
		},
	};
</script>
