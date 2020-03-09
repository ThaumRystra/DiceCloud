<template lang="html">
  <toolbar-card :color="color" @click="$emit('click')" :id="_id">
		<template slot="toolbar">
			<span>
				{{name}}
			</span>
			<v-spacer/>
		</template>
		<v-card-text v-if="description">
			<markdown-text :markdown="description"/>
		</v-card-text>
  </toolbar-card>
</template>

<script>
	import MarkdownText from '/imports/ui/components/MarkdownText.vue';
	import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';

	export default {
		props: {
			_id: String,
			name: String,
			description: String,
			color: String,
		},
		components: {
			MarkdownText,
			ToolbarCard,
		},
	};
</script>

<style lang="css" scoped>
</style>
