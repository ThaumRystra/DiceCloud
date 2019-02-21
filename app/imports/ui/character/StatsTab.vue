<template lang="html">
	<div class="stats-tab ma-2">

		<div class="px-2 pt-2">
			<health-bar-card-container :charId="charId"/>
		</div>

		<column-layout>

			<div class="ability-scores">
				<v-card>
					<v-list>
						<template v-for="(ability, index) in abilities">
							<v-divider v-if="index !== 0"/>
							<ability-list-tile
								v-bind="ability"
								:key="ability._id"
								:data-id="ability._id"
								@click="clickAttribute({_id: ability._id})"
							/>
						</template>
					</v-list>
				</v-card>
			</div>

			<div v-for="stat in stats" class="stat" :key="stat._id">
				<attribute-card
					v-bind="stat"
					:data-id="stat._id"
					@click="clickAttribute({_id: stat._id})"
				/>
			</div>

			<div v-for="modifier in modifiers" class="modifier" :key="modifier._id">
				<attribute-card modifier
					v-bind="modifier"
					:data-id="modifier._id"
					@click="clickAttribute({_id: modifier._id})"
				/>
			</div>

			<div class="hit-dice">
				<v-card>
					<v-list>
						<v-subheader>Hit Dice</v-subheader>
						<template v-for="(hitDie, index) in hitDice">
							<v-divider v-if="index !== 0" :key="hitDice._id + 'divider'"/>
							<hit-dice-list-tile
								v-bind="hitDie"
								:data-id="hitDie._id"
								:key="hitDice._id"
								@click="clickAttribute({_id: hitDie._id})"
								@change="e => hitDiceChange(hitDie._id, e)"
							/>
						</template>
					</v-list>
				</v-card>
			</div>

			<div class="saving-throws" v-show="true">
				<v-card>
					<v-list>
						<v-subheader>Saving Throws</v-subheader>
						<skill-list-tile
							v-for="save in savingThrows"
							v-bind="save"
							:key="save._id"
							:data-id="save._id"
							@click="clickSkill({_id: save._id})"
						/>
					</v-list>
				</v-card>
			</div>

			<div class="skills">
				<v-card>
					<v-list>
						<v-subheader>Skills</v-subheader>
						<skill-list-tile
							v-for="skill in skills"
							v-bind="skill"
							:key="skill._id"
							:data-id="skill._id"
							@click="clickSkill({_id: skill._id})"
						/>
					</v-list>
				</v-card>
			</div>

		</column-layout>

		<v-btn fixed fab bottom right
			color="primary"
			@click="insertAttribute"
			data-id="insert-attribute-fab"
		>
			<v-icon>add</v-icon>
		</v-btn>

	</div>
</template>

<script>
	import Attributes from '/imports/api/creature/properties/Attributes.js';
	import Skills from '/imports/api/creature/properties/Skills.js';
	import AttributeCard from '/imports/ui/components/AttributeCard.vue';
	import AbilityListTile from '/imports/ui/components/AbilityListTile.vue';
	import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
	import HealthBarCardContainer from '/imports/ui/components/HealthBarCardContainer.vue';
	import HitDiceListTile from '/imports/ui/components/HitDiceListTile.vue';
	import SkillListTile from '/imports/ui/components/SkillListTile.vue';

	import { adjustAttribute, insertAttribute } from '/imports/api/creature/properties/Attributes.js';

	const getAttributeOfType = function(charId, type){
		return Attributes.find({charId, type}, {sort: {order: 1}});
	};

	export default {
		props: {
			charId: String,
		},
		components: {
			AbilityListTile,
			AttributeCard,
			ColumnLayout,
			HealthBarCardContainer,
			HitDiceListTile,
			SkillListTile,
		},
		meteor: {
			abilities(){
				return getAttributeOfType(this.charId, 'ability');
			},
			stats(){
				return getAttributeOfType(this.charId, 'stat');
			},
			modifiers(){
				return getAttributeOfType(this.charId, 'modifier');
			},
			hitDice(){
				return Attributes.find({
					charId: this.charId,
					type: 'hitDice',
					value: {$ne: 0},
				}, {
					sort: {order: 1},
				}).map(hd => {
					let diceMatch = hd.variableName.match(/d(\d+)/);
					let dice = diceMatch && +diceMatch[1];
					let con = Attributes.findOne({
						charId: this.charId,
						variableName: 'constitution'
					});
					let conMod = con && con.mod;
					return {
						_id: hd._id,
						dice,
						conMod,
						key: hd._id,
						maxValue: hd.value,
						value: hd.value + (hd.adjustment || 0),
					}
				});
			},
			savingThrows(){
				return Skills.find({
					charId: this.charId,
					type: 'save',
				}, {
					sort: {order: 1},
				});
			},
			skills(){
				return Skills.find({
					charId: this.charId,
					type: 'skill',
				}, {
					sort: {order: 1},
				});
			},
		},
		methods: {
			clickAttribute({_id}){
				this.$store.commit('pushDialogStack', {
					component: 'attribute-dialog-container',
					elementId: _id,
					data: {_id},
				});
			},
			clickSkill({_id}){
				this.$store.commit('pushDialogStack', {
					component: 'skill-dialog-container',
					elementId: _id,
					data: {_id},
				});
			},
			hitDiceChange(_id, {type, value}){
				if (type === 'increment'){
					adjustAttribute.call({_id, increment: value});
				}
			},
			insertAttribute(){
				const charId = this.charId;
				this.$store.commit('pushDialogStack', {
					component: 'attribute-creation-dialog',
					elementId: 'insert-attribute-fab',
					callback(attribute){
						if (!attribute) return;
						attribute.charId = charId;
						let attId = insertAttribute.call({attribute});
						return attId
					}
				});
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
