<template lang="html">
	<v-list>
		<template v-for="(ability, index) in abilities">
			<v-divider v-if="index !== 0"/>
			<ability-list-tile
				:key="ability.name"
				:data-id="`${_uid}-${ability.name}`"
				v-bind="ability"
				@click="click({ability, elementId: `${_uid}-${ability.name}`})"
			/>
		</template>
	</v-list>
</template>

<script>
	import AbilityListTile from '/imports/ui/creature/properties/attributes/AbilityListTile.vue';
	import store from "/imports/ui/vuexStore.js";

	export default {
		data(){ return{
			abilities: [
				{
					name: "Strength",
					value: 8,
					mod: -1,
					effects: [
						{
							name: "Ghost Touch",
							operation: "add",
							result: -2,
							enabled: true,
							_id: Random.id(),
						},{
							name: "Some Base",
							operation: "base",
							result: 15,
							enabled: true,
							_id: Random.id(),
						},{
							name: "Some Multiply",
							operation: "mul",
							result: 1.5,
							enabled: true,
							_id: Random.id(),
						},{
							name: "Some Min",
							operation: "min",
							result: 8,
							enabled: true,
							_id: Random.id(),
						},{
							name: "Some Advantage",
							operation: "advantage",
							result: 1,
							enabled: true,
							_id: Random.id(),
						},{
							name: "Some Disadvantage",
							operation: "disadvantage",
							result: 1,
							enabled: true,
							_id: Random.id(),
						},{
							name: "Some Passive",
							operation: "passiveAdd",
							result: -2,
							calculation: "3-5",
							_id: Random.id(),
						},{
							name: "Some Conditional",
							operation: "conditional",
							calculation: "+8 Only when asleep",
							enabled: true,
							_id: Random.id(),
						},
					]
				}, {
					name: "Dexterity",
					value: 18,
					mod: 4,
				}, {
					name: "Constitution",
					value: 12,
					mod: 1,
				}, {
					name: "Intelligence",
					value: 20,
					mod: 5,
				}, {
					name: "Wisdom",
					value: 6,
					mod: -2,
				}, {
					name: "Charisma",
					value: 28,
					mod: 9,
				},
			]
		}},
		components: {
			AbilityListTile,
		},
		methods: {
			click({ability, elementId}){
				store.commit("pushDialogStack", {
					component: "attribute-dialog",
					elementId,
					data: ability,
				});
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
