<template lang="html">
	<v-card-text>
		<tree-node-list :children="children" group="example-group" :show-empty="false"/>
	</v-card-text>
</template>

<script>
	import TreeNodeList from '/imports/ui/components/tree/TreeNodeList.vue';

	export default {
		components: {
			TreeNodeList,
		},
		data(){ return {
			children: [
				{name: 'Point buy', children:[
					{name: 'Strength 14', children:[]},
					{name: 'Dexterity 8', children:[]},
					{name: 'Constitution 14', children:[]},
					{name: 'Intelligence 8', children:[]},
					{name: 'Wisdom 15', children:[]},
					{name: 'Charisma 12', children:[]},
				]},
				{name: 'Hermit', children:[
					{name: 'Discovery', children:[]},
				]},
				{name: 'Hill Dwarf', children: [
					{name: 'Dwarven combat training', children:[]},
					{name: 'Dwarven resilience', children:[]},
					{name: 'Dwarven toughness', children:[]},
					{name: 'Stone cutting', children:[]},
				]},
				{name: 'Cleric', children:[
					{name: 'Level 1', children:[
						{name: 'Spellcasting', children:[
							{name: 'Light', children:[]},
							{name: 'Sacred Flame', children:[]},
							{name: 'Thaumaturgy', children:[]},
						]},
						{name: 'Divine domain: Tempest', children:[]},
					]},
					{name: 'Level 2', children:[]},
					{name: 'Level 3', children:[]},
					{name: 'Level 4', children:[]},
					{name: 'Level 5', children:[]},
				]},
			],
			otherChildren: [],
			drag: false,
		}},
		computed: {
			dataString(){
				return JSON.stringify(this.children, null, 2);
			}
		},
		methods: {
			log: console.log,
		},
	};
</script>

<style lang="css" scoped>
</style>
