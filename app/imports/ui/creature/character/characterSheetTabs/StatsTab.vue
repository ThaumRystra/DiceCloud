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

			<div v-for="check in checks" class="check" :key="check._id">
				<attribute-card modifier
					v-bind="check"
					:data-id="check._id"
					@click="clickSkill({_id: check._id})"
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
								@change="e => incrementChange(hitDie._id, e)"
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

			<div
				v-for="resource in resources"
				:key="resource._id"
				class="resource"
			>
				<resource-card
					v-bind="resource"
					:data-id="resource._id"
					@click="clickAttribute({_id: resource._id})"
					@change="e => incrementChange(resource._id, e)"
				/>
			</div>

			<div class="spell-slots" v-if="spellSlots.length">
				<v-card>
					<v-list>
						<v-subheader>Spell Slots</v-subheader>
						<spell-slot-list-tile
							v-for="spellSlot in spellSlots"
							v-bind="spellSlot"
							:key="spellSlot._id"
							:data-id="spellSlot._id"
							@click="clickAttribute({_id: spellSlot._id})"
							@change="e => incrementChange(spellSlot._id, e)"
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
	import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

	import AttributeCard from '/imports/ui/properties/attributes/AttributeCard.vue';
	import AbilityListTile from '/imports/ui/properties/attributes/AbilityListTile.vue';
	import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
	import HealthBarCardContainer from '/imports/ui/properties/attributes/HealthBarCardContainer.vue';
	import HitDiceListTile from '/imports/ui/properties/attributes/HitDiceListTile.vue';
	import SkillListTile from '/imports/ui/properties/skills/SkillListTile.vue';
	import ResourceCard from '/imports/ui/properties/attributes/ResourceCard.vue';
	import SpellSlotListTile from '/imports/ui/properties/attributes/SpellSlotListTile.vue';

	let adjustAttribute = insertAttribute = () => console.error("this shit isn't defined");

	const getAttributeOfType = function(charId, type){
		return CreatureProperties.find({
			'ancestor.id': charId,
			type: 'attribute',
			attributeType: type,
		}, {
			sort: {order: 1}
		});
	};

	const getNonZeroAttributeOfType = function(charId, type){
		return CreatureProperties.find({
			'ancestor.id': charId,
			type: 'attribute',
			attributeType: type,
			value: {$ne: 0}
		}, {
			sort: {order: 1}
		});
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
			ResourceCard,
			SpellSlotListTile,
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
			resources(){
				return getNonZeroAttributeOfType(this.charId, 'resource');
			},
			spellSlots(){
				return getNonZeroAttributeOfType(this.charId, 'spellSlot');
			},
			hitDice(){
				return CreatureProperties.find({
					'ancestor.id': this.charId,
					type: 'attribute',
					attributeType: 'hitDice',
					value: {$ne: 0},
				}, {
					sort: {order: 1},
				}).map(hd => {
					let diceMatch = hd.variableName.match(/d(\d+)/);
					let dice = diceMatch && +diceMatch[1];
					let con = CreatureProperties.findOne({
						'ancestor.id': this.charId,
						type: 'attribute',
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
			checks(){
				return CreatureProperties.find({
					'ancestor.id': this.charId,
					type: 'skill',
					skillType: 'check',
				}, {
					sort: {order: 1},
				});
			},
			savingThrows(){
				return CreatureProperties.find({
					'ancestor.id': this.charId,
					type: 'skill',
					skillType: 'save',
				}, {
					sort: {order: 1},
				});
			},
			skills(){
				return CreatureProperties.find({
					'ancestor.id': this.charId,
					type: 'skill',
					skillType: 'skill',
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
			incrementChange(_id, {type, value}){
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
