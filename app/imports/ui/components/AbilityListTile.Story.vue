<template lang="html">
	<v-list>
		<template v-for="(ability, index) in abilities">
			<v-divider v-if="index !== 0"/>
			<ability-list-tile
				:key="ability.name"
				:id="_uid + ability.name"
				v-bind="ability"
				@click="click(_uid + ability.name, ability)"
			/>
		</template>
	</v-list>
</template>

<script>
	import AbilityListTile from '/imports/ui/components/AbilityListTile.vue';
	import store from "/imports/ui/vuexStore.js";

	export default {
		data(){ return{
			abilities: [
				{
					name: "Strength",
					score: 8,
					modifier: -1,
				}, {
					name: "Dexterity",
					score: 18,
					modifier: 4,
				}, {
					name: "Constitution",
					score: 12,
					modifier: 1,
				}, {
					name: "Intelligence",
					score: 20,
					modifier: 5,
				}, {
					name: "Wisdom",
					score: 6,
					modifier: -2,
				}, {
					name: "Charisma",
					score: 28,
					modifier: 9,
				},
			]
		}},
		components: {
			AbilityListTile,
		},
		methods: {
			click(elementId, data){
				store.commit("pushDialogStack", {
					component: "ability-dialog",
					elementId,
					data,
				});
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
