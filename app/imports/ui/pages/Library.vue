<template lang="html">
	<toolbar-layout>
		<span slot="toolbar">Library</span>
		<v-card class="ma-4">
			<library-contents-container>
			<v-card-text v-else-if="$subReady.library">
				You aren't subscribed to any libraries :O
			</v-card-text>
			<v-card-text v-if="!$subReady.library" class="layout row justify-center">
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
export default {
}
</script>

<style lang="css" scoped>
</style>
