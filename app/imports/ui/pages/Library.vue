<template lang="html">
	<toolbar-layout>
		<template slot="toolbar">
			Libraries
		</template>
		<v-card class="ma-4">
			<library-and-node/>
		</v-card>
	</toolbar-layout>
</template>

<script>
	import ToolbarLayout from '/imports/ui/layouts/ToolbarLayout.vue';
	import LibraryAndNode from '/imports/ui/library/LibraryAndNode.vue';
	export default {
		components: {
			ToolbarLayout,
			LibraryAndNode,
		},
	};
</script>
