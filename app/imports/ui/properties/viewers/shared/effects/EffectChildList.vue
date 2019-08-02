<template lang="html">
  <v-list two-line v-if="this.effects && this.effects.length">
		<effect-list-tile
			:show-stat-name="showStatName"
			v-for="effect in sortedEffects"
			v-bind="effect"
			v-on="$listeners.click ? { click(e){$emit('click', e)} } : {}"
			:key="effect._id"
		/>
  </v-list>
</template>

<script>
	import EffectListTile from '/imports/ui/properties/viewers/shared/effects/EffectListTile.vue';
	import sortEffects from '/imports/ui/utility/sortEffects.js';

	export default {
		props: {
			effects: Array,
			showStatName: Boolean,
		},
		components: {
			EffectListTile,
		},
		computed: {
			sortedEffects(){
				return sortEffects(this.effects);
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
