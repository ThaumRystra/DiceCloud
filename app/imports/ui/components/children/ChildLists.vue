<template lang="html">
	<div v-if="effects && effects.length">
		<h6 class="title">Effects</h6>
		<effect-child-list
			show-stat-name
			:effects="effects"
			@click="e => $emit('clickedEffect', e)"
		/>
	</div>
</template>

<script>
	import EffectChildList from '/imports/ui/components/children/effects/EffectChildList.vue';

	export default {
		props: {
			effects: Array,
			proficiencies: Array,
			actions: Array,
			attacks: Array,
		},
	};
</script>

<style lang="css" scoped>
</style>
