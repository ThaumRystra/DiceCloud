<template lang="html">
	<v-card>
		<v-card-text>
			<health-bar
				v-for="attribute in attributes"
				:key="attribute._id"
				:value="attribute.value + (attribute.adjustment || 0)"
				:maxValue="attribute.value"
				@change="e => $emit('change', {_id: attribute._id, change: e})"
			/>
		</v-card-text>
	</v-card>
</template>

<script>
	import HealthBar from '/imports/ui/components/HealthBar.vue';

	export default {
		props: {
			attributes: Array,
		},
		components: {
			HealthBar,
		},
	}
</script>
