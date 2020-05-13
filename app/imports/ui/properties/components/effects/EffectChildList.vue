<template lang="html">
  <v-list
    v-if="effects && effects.length"
    two-line
  >
    <effect-list-tile
      v-for="effect in sortedEffects"
      :key="effect._id"
      :show-stat-name="showStatName"
      :model="effect"
      v-on="$listeners.click ? { click(e){$emit('click', e)} } : {}"
    />
  </v-list>
</template>

<script>
	import EffectListTile from '/imports/ui/properties/components/effects/EffectListTile.vue';
	import sortEffects from '/imports/ui/utility/sortEffects.js';

	export default {
		components: {
			EffectListTile,
		},
		props: {
			effects: Array,
			showStatName: Boolean,
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
