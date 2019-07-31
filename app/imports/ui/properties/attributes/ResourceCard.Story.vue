<template lang="html">
	<column-layout>
		<div>
			<resource-card
				data-id="abc123"
				name="Sorcery points"
				color="#f44336"
				:value="8"
				:adjustment="-2"
			/>
		</div>
		<div>
			<resource-card
				data-id="abc123"
				name="Psionic point like things"
				color="#f44336"
				:value="34"
				:adjustment="-12"
			/>
		</div>
		<div>
			<resource-card
				data-id="abc123"
				name="Rages"
				color="#f44336"
				:value="1"
				:adjustment="0"
			/>
		</div>
	</column-layout>
</template>

<script>
	import ResourceCard from '/imports/ui/properties/attributes/ResourceCard.vue';
	import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';

	export default {
		dontWrap: true,
		components: {
			ColumnLayout,
			ResourceCard,
		},
	};
</script>

<style lang="css" scoped>
</style>
