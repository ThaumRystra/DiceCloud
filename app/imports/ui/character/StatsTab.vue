<template lang="html">
	<div class="stats-tab ma-2">

		<div class="px-2 pt-2">
			<v-card>
				<v-card-text>
					<health-bar
						v-for="healthBar in healthBars"
						:key="healthBar._id"
						:value="healthBar.value + (healthBar.adjustment || 0)"
						:maxValue="healthBar.value"
					/>
				</v-card-text>
			</v-card>
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
								:id="`${_uid}-${ability._id}`"
								@click="clickAbility({elementId: `${_uid}-${ability._id}`, abilityId: ability._id})"
							/>
						</template>
					</v-list>
				</v-card>
			</div>

			<div v-for="stat in stats" class="stat">
				<attribute-card
					:name="stat.name"
					:value="stat.value"
				/>
			</div>

			<div v-for="modifier in modifiers" class="modifier">
				<attribute-card modifier
					:name="modifier.name"
					:value="modifier.value"
				/>
			</div>

			<div class="hit-dice">
				<v-card>
					<v-list>
						<v-subheader>Hit Dice</v-subheader>
						<template v-for="(hitDie, index) in hitDice">
							<v-divider v-if="index !== 0"/>
							<hit-dice-list-tile
								v-bind="hitDie"
							/>
						</template>
					</v-list>
				</v-card>
			</div>

			<div class="saving-throws">
				<v-card>
					<v-list>
						<v-subheader>Saving Throws</v-subheader>
						<skill-list-tile
							v-for="save in savingThrows"
							v-bind="save"
							:key="save._id"
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
						/>
					</v-list>
				</v-card>
			</div>

		</column-layout>

	</div>
</template>

<script>
	import Attributes from '/imports/api/creature/properties/Attributes.js';
	import Skills from '/imports/api/creature/properties/Skills.js';
	import AttributeCard from '/imports/ui/components/AttributeCard.vue';
	import AbilityListTile from '/imports/ui/components/AbilityListTile.vue';
	import ColumnLayout from "/imports/ui/components/ColumnLayout.vue";
	import HealthBar from '/imports/ui/components/HealthBar.vue';
	import HitDiceListTile from '/imports/ui/components/HitDiceListTile.vue';
	import SkillListTile from '/imports/ui/components/SkillListTile.vue';

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
			HealthBar,
			HitDiceListTile,
			SkillListTile,
		},
		meteor: {
			healthBars(){
				return Attributes.find({
					charId: this.charId,
					type: 'healthBar',
					value: {$ne: 0},
				}, {
					sort: {order: 1},
				});
			},
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
						variableName: "constitution"
					});
					let conMod = con && con.mod;
					return {
						dice,
						conMod,
						key: hd._id,
						maxValue: hd.value,
						value: hd.value - (hd.adjustment || 0),
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
			clickAbility({elementId, abilityId}){
				this.$store.commit("pushDialogStack", {
					component: "ability-dialog-container",
					elementId,
					data: {_id: abilityId},
				});
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
