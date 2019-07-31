<template lang="html">
  <skill-dialog
		v-bind="skill"
		:effects="effects"
		:proficiencies="proficiencies"
		:abilityDoc="abilityDoc"
		v-on="{clickedEffect, clickedProficiency, change}"
	/>
</template>

<script>

	import SkillDialog from '/imports/ui/properties/skills/SkillDialog.vue';
	import Skills from '/imports/api/properties/Skills.js';
	import { updateSkill } from '/imports/api/properties/Skills.js';
	import Attributes from '/imports/api/properties/Attributes.js';
	import Effects from '/imports/api/properties/Effects.js';
	import Proficiencies from '/imports/api/properties/Proficiencies.js';

	export default {
		components: {
			SkillDialog,
		},
		props: {
			_id: String,
		},
		meteor: {
			skill(){
				return Skills.findOne(this._id);
			},
			abilityDoc(){
				return this.skill && Attributes.findOne({
					variableName: this.skill.ability,
				});
			},
			effects(){
				if (!this.skill) return;
				let charId = this.skill.charId;
				let stat = this.skill.variableName;
				return Effects.find({
					charId,
					stat,
					enabled: true,
				}, {
					sort: {order: 1},
				}).fetch();
			},
			proficiencies(){
				if (!this.skill) return;
				let charId = this.skill.charId;
				let stat = this.skill.variableName;
				return Proficiencies.find({
					charId,
					stat,
					enabled: true,
				}, {
					sort: {order: 1},
				}).fetch();
			},
		},
		methods: {
			clickedEffect(e){
				console.log(e);
			},
			clickedProficiency(e){
				console.log(e);
			},
			change(update, ack){
				updateSkill.call({_id: this._id, update}, error => {
					ack(error);
				});
			},
		}
	};
</script>

<style lang="css" scoped>
</style>
