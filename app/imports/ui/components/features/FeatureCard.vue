<template lang="html">
  <toolbar-card :color="color" @click="$emit('click')">
  	<span slot="toolbar">
			{{name}}
		</span>
		<v-spacer slot="toolbar"/>
		<v-checkbox
			hide-details
			class="shrink"
			v-if="!alwaysEnabled"
			:value="enabled"
			@change="enabled => $emit('change', {enabled})"
			slot="toolbar"
		/>
		<v-card-text>
			{{description}}
		</v-card-text>
  </toolbar-card>
</template>

<script>
	import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';

	export default {
		props: {
			charId: String,
			name: String,
			description: String,
			color: String,
			enabled: Boolean,
			alwaysEnabled: Boolean,
		},
		components: {
			ToolbarCard,
		},
	};
</script>

<style lang="css" scoped>
</style>
