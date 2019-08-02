<template lang="html">
	<dialog-base class="skill-dialog">
		<div slot="toolbar">
			{{name}}
		</div>
		<div>
			<v-layout align-center justify-center>
				<skill-list-tile v-bind="$props"/>
			</v-layout>
			<skill-proficiency-list v-if="skillBaseProficiency" :effects="[skillBaseProficiency]"/>
			<effect-child-list v-if="skillAbilityEffect" :effects="[skillAbilityEffect]"/>
			<effect-child-list v-if="skillBaseEffect" :effects="[skillBaseEffect]"/>

			<div v-if="proficiencies && proficiencies.length">
				<h6 class="title">Proficiencies</h6>
				<skill-proficiency-list :proficiencies="proficiencies" @click="clickedProficiency"/>
			</div>
			<div v-if="effects && effects.length">
				<h6 class="title">Effects</h6>
				<effect-child-list :effects="effects" @click="clickedEffect"/>
			</div>
		</div>
		<div slot="edit">
			<skill-edit :skill="$props" @change="(update, ack) => $emit('change', update, ack)"/>
		</div>
	</dialog-base>
</template>

<script>
	import EffectChildList from '/imports/ui/properties/viewers/shared/effects/EffectChildList.vue';
	import DialogBase from "/imports/ui/dialogStack/DialogBase.vue";
	import SkillEdit from '/imports/ui/properties/skills/SkillEdit.vue';
	import SkillProficiencyList from '/imports/ui/properties/skills/SkillProficiencyList.vue';
	import SkillListTile from '/imports/ui/properties/skills/SkillListTile.vue';

	export default {
		components: {
			EffectChildList,
			DialogBase,
			SkillEdit,
			SkillListTile,
			SkillProficiencyList,
		},
		props: {
			charId: String,
			name: String,
			variableName: String,
			ability: String,
			type: String,
			order: Number,
			baseValue: Number,
			baseProficiency: Number,
			value: Number,
			abilityMod: Number,
			advantage: Number,
			passiveBonus: Number,
			proficiency: Number,
			conditionalBenefits: Number,
			fail: Number,
			effects: {
				type: Array,
				default: () => [],
			},
			proficiencies: {
				type: Array,
				default: () => [],
			},
			abilityDoc: Object,
		},
		computed: {
			skillBaseEffect(){
				if (!this.baseValue) return;
				return {
					_id: 'skillBaseValue',
					name: `${this.name}`,
					operation: 'base',
					result: this.baseValue,
					stat: this.variableName,
					enabled: true,
				};
			},
			skillAbilityEffect(){
				if (!this.abilityDoc) return;
				return {
					_id: 'skillBaseValue',
					name: this.abilityDoc.name,
					operation: 'add',
					result: this.abilityMod,
					stat: this.variableName,
					enabled: true,
				};
			},
			skillBaseProficiency(){
				if (!this.baseProficiency) return;
				return {
					_id: 'skillBaseValue',
					name: `${this.name}`,
					value: this.baseProficiency,
					skill: this.variableName,
					enabled: true,
				};
			},
		},
	}
</script>

<style lang="css" scoped>
</style>
