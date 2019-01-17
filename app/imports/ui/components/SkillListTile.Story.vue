<template lang="html">
	<v-list>
		<skill-list-tile
			v-for="skill in skills"
			:key="skill.name"
			v-bind="skill"
			@click="click"
		/>
	</v-list>
</template>

<script>
	import SkillListTile from '/imports/ui/components/SkillListTile.vue';
	export default {
		data(){return {
			skills: [
				{
					name: 'Animal Handling',
					proficiency: 1,
					modifier: 4,
				}, {
					name: 'Deception',
					proficiency: 0,
					modifier: -0,
					advantage: true,
					disadvantage: true,
				}, {
					name: 'Intimidation',
					proficiency: 2,
					modifier: 6,
					advantage: true,
				}, {
					name: 'Insight',
					proficiency: 0.5,
					modifier: -2,
					disadvantage: true,
				}, {
					name: 'History',
					conditionalBenefit: "Some cool benefit",
					fail: true,
					disadvantage: true,
				}
			]
		}},
		components: {
			SkillListTile,
		},
		methods: {
			click(){
				console.log(...arguments);
			},
		},
	}
</script>

<style lang="css" scoped>
</style>
