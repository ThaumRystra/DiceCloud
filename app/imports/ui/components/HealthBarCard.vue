<template lang="html">
	<v-card class="pa-2">
		<health-bar
			v-for="attribute in attributes"
			:key="attribute._id"
			:value="attribute.value + (attribute.adjustment || 0)"
			:maxValue="attribute.value"
			:name="attribute.name"
			@change="e => $emit('change', {_id: attribute._id, change: e})"
			@click="e => $emit('click', {_id: attribute._id, elementId: e.elementId})"
		/>
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
