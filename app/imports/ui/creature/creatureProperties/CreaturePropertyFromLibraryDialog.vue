<template lang="html">
	<dialog-base>
		<div slot="toolbar">Add from library</div>
		<library-and-node
			slot="unwrapped-content"
			@selected="val => node = val"
			style="height: 100%;"
		/>
		<template slot="actions">
			<v-spacer/>
			<v-btn
				flat
				@click="$store.dispatch('popDialogStack', node)"
				color="primary"
			>Insert</v-btn>
		</template>
	</dialog-base>
</template>

<script>
	import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
	import LibraryAndNode from '/imports/ui/library/LibraryAndNode.vue';
	export default {
		components: {
			DialogBase,
			LibraryAndNode,
		},
		data(){return {
			node: undefined,
		};},
	};
</script>

<style lang="css" scoped>
</style>
