<template lang="html">
  <toolbar-card :color="color" @click="$emit('click')" :id="_id">
		<template slot="toolbar">
			<span>
				{{name}}
			</span>
			<v-spacer/>
			<v-checkbox
				hide-details
				class="shrink"
				v-if="!alwaysEnabled"
				:value="enabled"
				@click.stop="$emit('update', {_id, update: {enabled: !enabled}})"
			/>
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
			charId: String,
			name: String,
			description: String,
			color: String,
			enabled: Boolean,
			alwaysEnabled: Boolean,
		},
		components: {
			MarkdownText,
			ToolbarCard,
		},
	};
</script>

<style lang="css" scoped>
</style>
