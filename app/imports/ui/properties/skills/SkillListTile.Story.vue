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
	import SkillListTile from '/imports/ui/properties/skills/SkillListTile.vue';
	export default {
		data(){return {
			skills: [
				{
					name: 'Animal Handling',
					proficiency: 1,
					value: 4,
				}, {
					name: 'Deception',
					proficiency: 0,
					value: -0,
					advantage: 0,
				}, {
					name: 'Intimidation',
					proficiency: 2,
					value: 6,
					advantage: 1,
				}, {
					name: 'Insight',
					proficiency: 0.5,
					value: -2,
					advantage: -1,
				}, {
					name: 'History',
					conditionalBenefits: 1,
					fail: 1,
					advantage: -1,
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
