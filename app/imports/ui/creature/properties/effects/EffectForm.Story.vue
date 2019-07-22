<template lang="html">
	<v-card-text>
		<template v-for="(effect, index) in effects">
			<v-divider v-if="index != 0"/>
			<effect-form :key="index" :effect="effect" :stats="stats" @change="e => change(index, e)"/>
		</template>
	</v-card-text>
</template>

<script>
import EffectForm from '/imports/ui/creature/properties/effects/EffectForm.vue';
export default {
	data(){ return {
		effects: [
			{
				operation: 'add',
				calculation: '2',
				stat: '',
			},
			{
				operation: 'mul',
				calculation: '2',
				stat: 'strength',
			},
			{
				operation: 'base',
				calculation: 'strength + 4',
				result: 6,
				stat: 'dexterity',
			},
		],
		stats: [
			{name: "Strength", variableName: "strength"},
		],
	}},
	components: {
		EffectForm,
	},
	methods: {
		change(index, e){
			for (let i in e){
				this.effects[index][i] = e[i];
				console.log({e, effect: this.effects[index]})
			}
		},
	},
};
</script>

<style lang="css" scoped>
</style>
