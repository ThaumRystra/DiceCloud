<template lang="html">
  <v-expansion-panel
		class="effect-edit-expansion-list"
		v-model="expanded"
	>
  	<v-expansion-panel-content
			v-for="(effect, index) in effects"
			:key="effect._id"
			lazy
		>
  		<effect-list-tile
				slot="header"
				class="effect-list-tile"
				:class="{'primary--text': expanded === index}"
				v-bind="effect"
			/>
			<effect-form
				:effect="effect"
				:stats="stats"
				@change="({set, ack}) => $emit('change', {set, ack, effectId: effect._id, index})"
			/>
  	</v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
	import EffectForm from '/imports/ui/creature/properties/effects/EffectForm.vue';
	import EffectListTile from '/imports/ui/creature/properties/effects/EffectListTile.vue';
	export default {
		props: {
			effects: Array,
			stats: Array,
		},
		components: {
			EffectForm,
			EffectListTile,
		},
		data(){ return {
			expanded: null,
		}},
	};
</script>

<style lang="css" scoped>
	.effect-edit-expansion-list >>> .v-expansion-panel__header {
		padding-left: 0;
		padding-right: 8px;
		max-width: 100%;
		overflow: hidden;
	}
	.effect-list-tile {
		width: calc(100% - 26px);
	}
</style>
