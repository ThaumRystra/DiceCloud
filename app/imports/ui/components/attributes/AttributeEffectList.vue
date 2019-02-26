<template lang="html">
  <v-list two-line v-if="this.effects && this.effects.length">
		<effect-list-tile
			v-for="effect in sortedEffects"
			v-bind="effect"
			v-on="$listeners.click ? { click(e){$emit('click', e)} } : {}"
			:key="effect._id"
		/>
  </v-list>
</template>

<script>
	import EffectListTile from '/imports/ui/components/EffectListTile.vue';
	const SORT_INDEX = {
		"base": 1,
		"add": 2,
		"mul": 3,
		"min": 4,
		"max": 5,
		"advantage": 6,
		"disadvantage": 7,
		"passiveAdd": 8,
		"fail": 9,
		"conditional": 10,
	};

	export default {
		props: {
			effects: Array,
		},
		components: {
			EffectListTile,
		},
		computed: {
			sortedEffects(){
				if (!this.effects || !this.effects.length) return [];
				return [...this.effects].sort(
					(a, b) => (SORT_INDEX[a.operation] || 99) - (SORT_INDEX[b.operation] || 99)
				);
			}
		},
	};
</script>

<style lang="css" scoped>
</style>
