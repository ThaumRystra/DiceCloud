<template lang="html">
  <div class="stats-tab ma-2">
    <div class="px-2 pt-2">
      <health-bar-card-container :creature-id="creatureId" />
    </div>

    <column-layout>
      <div class="ability-scores">
        <v-card>
          <v-list>
            <template v-for="(ability, index) in abilities">
              <v-divider
                v-if="index !== 0"
                :key="index"
              />
              <ability-list-tile
                :key="ability._id"
                :model="ability"
                :data-id="ability._id"
                @click="clickProperty({_id: ability._id})"
              />
            </template>
          </v-list>
        </v-card>
      </div>

      <div
        v-for="stat in stats"
        :key="stat._id"
        class="stat"
      >
        <attribute-card
          v-bind="stat"
          :data-id="stat._id"
          @click="clickProperty({_id: stat._id})"
        />
      </div>

      <div
        v-for="modifier in modifiers"
        :key="modifier._id"
        class="modifier"
      >
        <attribute-card
          modifier
          v-bind="modifier"
          :data-id="modifier._id"
          @click="clickProperty({_id: modifier._id})"
        />
      </div>

      <div
        v-for="check in checks"
        :key="check._id"
        class="check"
      >
        <attribute-card
          modifier
          v-bind="check"
          :data-id="check._id"
          @click="clickProperty({_id: check._id})"
        />
      </div>

      <div class="hit-dice">
        <v-card>
          <v-list>
            <v-subheader>Hit Dice</v-subheader>
            <template v-for="(hitDie, index) in hitDice">
              <v-divider
                v-if="index !== 0"
                :key="hitDie._id + 'divider'"
              />
              <hit-dice-list-tile
                :key="hitDie._id"
                v-bind="hitDie"
                :data-id="hitDie._id"
                @click="clickProperty({_id: hitDie._id})"
                @change="e => incrementChange(hitDie._id, e)"
              />
            </template>
          </v-list>
        </v-card>
      </div>

      <div
        v-show="true"
        class="saving-throws"
      >
        <v-card>
          <v-list>
            <v-subheader>Saving Throws</v-subheader>
            <skill-list-tile
              v-for="save in savingThrows"
              :key="save._id"
              v-bind="save"
              :data-id="save._id"
              @click="clickProperty({_id: save._id})"
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
              :key="skill._id"
              v-bind="skill"
              :data-id="skill._id"
              @click="clickProperty({_id: skill._id})"
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
          @click="clickProperty({_id: resource._id})"
          @change="e => incrementChange(resource._id, e)"
        />
      </div>

      <div
        v-if="spellSlots.length"
        class="spell-slots"
      >
        <v-card>
          <v-list>
            <v-subheader>Spell Slots</v-subheader>
            <spell-slot-list-tile
              v-for="spellSlot in spellSlots"
              :key="spellSlot._id"
              v-bind="spellSlot"
              :data-id="spellSlot._id"
              @click="clickProperty({_id: spellSlot._id})"
              @change="e => incrementChange(spellSlot._id, e)"
            />
          </v-list>
        </v-card>
      </div>

      <div
        v-if="actions.length"
        class="actions"
      >
        <v-card>
          <v-list
            two-line
            subheader
          >
            <v-subheader>Actions</v-subheader>
            <action-list-tile
              v-for="action in actions"
              :key="action._id"
              :model="action"
              :data-id="action._id"
              @click="clickProperty({_id: action._id})"
            />
            <v-subheader>Attacks</v-subheader>
            <attack-list-tile
              v-for="attack in attacks"
              :key="attack._id"
              :model="attack"
              :data-id="attack._id"
              @click="clickProperty({_id: attack._id})"
            />
          </v-list>
        </v-card>
      </div>
    </column-layout>
  </div>
</template>

<script>
	import CreatureProperties, { damageProperty } from '/imports/api/creature/CreatureProperties.js';
	import AttributeCard from '/imports/ui/properties/components/attributes/AttributeCard.vue';
	import AbilityListTile from '/imports/ui/properties/components/attributes/AbilityListTile.vue';
	import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
	import HealthBarCardContainer from '/imports/ui/properties/components/attributes/HealthBarCardContainer.vue';
	import HitDiceListTile from '/imports/ui/properties/components/attributes/HitDiceListTile.vue';
	import SkillListTile from '/imports/ui/properties/components/skills/SkillListTile.vue';
	import ResourceCard from '/imports/ui/properties/components/attributes/ResourceCard.vue';
	import SpellSlotListTile from '/imports/ui/properties/components/attributes/SpellSlotListTile.vue';
  import ActionListTile from '/imports/ui/properties/components/actions/ActionListTile.vue';
  import AttackListTile from '/imports/ui/properties/components/actions/AttackListTile.vue';

	const getAttributeOfType = function(charId, type){
		return CreatureProperties.find({
			'ancestors.id': charId,
			type: 'attribute',
			attributeType: type,
			removed: {$ne: true},
		}, {
			sort: {order: 1}
		});
	};

	const getNonZeroAttributeOfType = function(charId, type){
		return CreatureProperties.find({
			'ancestors.id': charId,
			type: 'attribute',
			attributeType: type,
			value: {$ne: 0},
			removed: {$ne: true},
		}, {
			sort: {order: 1}
		});
	};

	export default {
		components: {
			AbilityListTile,
			AttributeCard,
			ColumnLayout,
			HealthBarCardContainer,
			HitDiceListTile,
			SkillListTile,
			ResourceCard,
			SpellSlotListTile,
      ActionListTile,
      AttackListTile,
		},
		props: {
			creatureId: {
        type: String,
        required: true,
      },
		},
		meteor: {
			abilities(){
				return getAttributeOfType(this.creatureId, 'ability');
			},
			stats(){
				return getAttributeOfType(this.creatureId, 'stat');
			},
			modifiers(){
				return getAttributeOfType(this.creatureId, 'modifier');
			},
			resources(){
				return getNonZeroAttributeOfType(this.creatureId, 'resource');
			},
			spellSlots(){
				return getNonZeroAttributeOfType(this.creatureId, 'spellSlot');
			},
			hitDice(){
				return CreatureProperties.find({
					'ancestors.id': this.creatureId,
					type: 'attribute',
					attributeType: 'hitDice',
					value: {$ne: 0},
				}, {
					sort: {order: 1},
				}).map(hd => {
					let diceMatch = hd.variableName.match(/d(\d+)/);
					let dice = diceMatch && +diceMatch[1];
					let con = CreatureProperties.findOne({
						'ancestors.id': this.creatureId,
						type: 'attribute',
						variableName: 'constitution',
            removed: {$ne: true},
					});
					let conMod = con && con.mod;
					return {
						_id: hd._id,
						dice,
						conMod,
						key: hd._id,
						maxValue: hd.value,
						value: hd.value - (hd.damage || 0),
					}
				});
			},
			checks(){
				return CreatureProperties.find({
					'ancestors.id': this.creatureId,
					type: 'skill',
					skillType: 'check',
          removed: {$ne: true},
				}, {
					sort: {order: 1},
				});
			},
			savingThrows(){
				return CreatureProperties.find({
					'ancestors.id': this.creatureId,
					type: 'skill',
					skillType: 'save',
          removed: {$ne: true},
				}, {
					sort: {order: 1},
				});
			},
			skills(){
				return CreatureProperties.find({
					'ancestors.id': this.creatureId,
					type: 'skill',
					skillType: 'skill',
          removed: {$ne: true},
				}, {
					sort: {order: 1},
				});
			},
      actions(){
				return CreatureProperties.find({
					'ancestors.id': this.creatureId,
					type: 'action',
          removed: {$ne: true},
				}, {
					sort: {order: 1},
				});
			},
      attacks(){
				return CreatureProperties.find({
					'ancestors.id': this.creatureId,
					type: 'attack',
          removed: {$ne: true},
				}, {
					sort: {order: 1},
				});
			},
		},
		methods: {
			clickProperty({_id}){
				this.$store.commit('pushDialogStack', {
					component: 'creature-property-dialog',
					elementId: `${_id}`,
					data: {_id},
				});
			},
			incrementChange(_id, {type, value}){
				if (type === 'increment'){
					damageProperty.call({_id, operation: 'increment' ,value: -value});
				}
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
