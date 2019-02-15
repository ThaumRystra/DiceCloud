<template lang="html">
	<effect-edit-expansion-list
		:effects="effects"
		:stats="stats"
		@change="change"
	/>
</template>

<script>
import EffectEditExpansionList from '/imports/ui/components/EffectEditExpansionList.vue';
export default {
	data(){ return {
		effects: [
			{
				name: "Ghost Touch",
				stat: 'Strength',
				operation: "add",
				result: -2,
				calculation: '-2',
				enabled: true,
				_id: Random.id(),
			},{
				name: "Some Base",
				stat: 'Strength',
				operation: "base",
				result: 15,
				calculation: '15',
				enabled: true,
				_id: Random.id(),
			},{
				name: "Some Multiply",
				stat: 'Strength',
				operation: "mul",
				result: 1.5,
				calculation: '1.5',
				enabled: true,
				_id: Random.id(),
			},{
				name: "Some Min",
				stat: 'Strength',
				operation: "min",
				result: 8,
				calculation: '8',
				enabled: true,
				_id: Random.id(),
			},{
				name: "Some Advantage",
				stat: 'Strength',
				operation: "advantage",
				result: 1,
				calculation: '1',
				enabled: true,
				_id: Random.id(),
			},{
				name: "Some Disadvantage",
				stat: 'Strength',
				operation: "disadvantage",
				result: 1,
				calculation: '1',
				enabled: true,
				_id: Random.id(),
			},{
				name: "Some Passive",
				stat: 'Strength',
				operation: "passiveAdd",
				result: -2,
				calculation: '-2',
				calculation: "3-5",
				_id: Random.id(),
			},{
				name: "Some Conditional",
				stat: 'Strength',
				operation: "conditional",
				calculation: "+8 Only when asleep",
				result: "+8 Only when asleep",
				enabled: true,
				_id: Random.id(),
			},
		],
		stats: ["Strength", "Dexterity", "Constitution", "Speed"].map( a => ({
			name: a,
			variableName: a,
		})),
	}},
	components: {
		EffectEditExpansionList,
	},
	methods: {
		change({set, ack, effectId, index}){
			console.log({set, ack, effectId, index});
			for (let key in set){
				this.effects[index][key] = set[key];
				if (key === 'calculation'){
					this.effects[index].result = set[key]
				}
				ack();
			}
		},
	},
};
</script>

<style lang="css" scoped>
</style>
