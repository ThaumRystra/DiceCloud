<template lang="html">
	<v-list>
		<v-subheader>Hit Dice</v-subheader>
		<template v-for="(hitDie, index) in hitDice">
			<v-divider v-if="index !== 0"/>
			<hit-dice-list-tile
				:key="hitDie.dice"
				v-bind="hitDie"
				@click="click"
				@change="e => change(hitDie, e)"
			/>
		</template>
	</v-list>
</template>

<script>
	import HitDiceListTile from '/imports/ui/components/HitDiceListTile.vue';
	export default {
		data(){ return{
			hitDice: [
				{
					dice: 6,
					value: 20,
					maxValue: 20,
					conMod: 4,
				}, {
					dice: 8,
					value: 3,
					maxValue: 3,
					conMod: 4,
				}, {
					dice: 10,
					value: 3,
					maxValue: 3,
					conMod: 4,
				}, {
					dice: 12,
					value: 1,
					maxValue: 1,
					conMod: 4,
				},
			]
		}},
		components: {
			HitDiceListTile,
		},
		methods: {
			click(e){
				console.log(e);
			},
			change(hitDie, e){
				if (e.type === 'increment'){
					hitDie.value += e.value;
					if (hitDie.value > hitDie.maxValue){
						hitDie.value = hitDie.maxValue;
					} else if (hitDie.value < 0){
						hitDie.value = 0;
					}
				}
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
