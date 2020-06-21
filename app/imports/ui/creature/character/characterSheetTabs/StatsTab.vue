<template lang="html">
  <div
    class="stats-tab ma-2"
  >
    <div class="px-2 pt-2">
      <health-bar-card-container :creature-id="creatureId" />
    </div>

    <column-layout>
      <div class="character-buttons">
        <v-card>
          <v-card-text class="layout column align-center">
            <rest-button
              :creature-id="creatureId"
              type="shortRest"
            />
            <rest-button
              :creature-id="creatureId"
              type="longRest"
            />
          </v-card-text>
        </v-card>
      </div>

      <div
        v-if="appliedBuffs.length"
        class="buffs"
      >
        <v-card>
          <v-list>
            <v-subheader>Buffs and conditions</v-subheader>
            <v-list-tile
              v-for="buff in appliedBuffs"
              :key="buff._id"
              :data-id="buff._id"
              @click="clickProperty({_id: buff._id})"
            >
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ buff.name }}
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn
                  icon
                  flat
                  @click.stop="softRemove(buff._id)"
                >
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card>
      </div>

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
                :model="hitDie"
                :data-id="hitDie._id"
                @click="clickProperty({_id: hitDie._id})"
                @change="e => incrementChange(hitDie._id, e)"
              />
            </template>
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
        v-if="spellSlots && spellSlots.length"
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

      <div v-if="numKeys(creature.damageMultipliers)">
        <damage-multiplier-card :model="creature.damageMultipliers" />
      </div>

      <div class="saving-throws">
        <v-card>
          <v-list>
            <v-subheader>Saving Throws</v-subheader>
            <skill-list-tile
              v-for="save in savingThrows"
              :key="save._id"
              :model="save"
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
              :model="skill"
              :data-id="skill._id"
              @click="clickProperty({_id: skill._id})"
            />
          </v-list>
        </v-card>
      </div>

      <div
        v-for="action in actions"
        :key="action._id"
        class="actions"
      >
        <action-card
          :model="action"
          :data-id="action._id"
          @click="clickProperty({_id: action._id})"
        />
      </div>
      <div
        v-for="attack in attacks"
        :key="attack._id"
        class="attacks"
      >
        <action-card
          attack
          :model="attack"
          :data-id="attack._id"
          @click="clickProperty({_id: attack._id})"
        />
      </div>

      <div
        v-if="weapons && weapons.length"
        class="weapon-proficiencies"
      >
        <v-card>
          <v-list>
            <v-subheader>
              Weapons
            </v-subheader>
            <skill-list-tile
              v-for="weapon in weapons"
              :key="weapon._id"
              hide-modifier
              :model="weapon"
              :data-id="weapon._id"
              @click="clickProperty({_id: weapon._id})"
            />
          </v-list>
        </v-card>
      </div>
      <div
        v-if="armors && armors.length"
        class="armor-proficiencies"
      >
        <v-card>
          <v-list>
            <v-subheader>
              Armor
            </v-subheader>
            <skill-list-tile
              v-for="armor in armors"
              :key="armor._id"
              hide-modifier
              :model="armor"
              :data-id="armor._id"
              @click="clickProperty({_id: armor._id})"
            />
          </v-list>
        </v-card>
      </div>
      <div
        v-if="tools && tools.length"
        class="tool-proficiencies"
      >
        <v-card>
          <v-list>
            <v-subheader>
              Tools
            </v-subheader>
            <skill-list-tile
              v-for="tool in tools"
              :key="tool._id"
              hide-modifier
              :model="tool"
              :data-id="tool._id"
              @click="clickProperty({_id: tool._id})"
            />
          </v-list>
        </v-card>
      </div>
      <div
        v-if="languages && languages.length"
        class="language-proficiencies"
      >
        <v-card>
          <v-list>
            <v-subheader>
              Languages
            </v-subheader>
            <skill-list-tile
              v-for="language in languages"
              :key="language._id"
              hide-modifier
              :model="language"
              :data-id="language._id"
              @click="clickProperty({_id: language._id})"
            />
          </v-list>
        </v-card>
      </div>
    </column-layout>
  </div>
</template>

<script>
  import Creatures from '/imports/api/creature/Creatures.js';
	import { damageProperty, softRemoveProperty } from '/imports/api/creature/CreatureProperties.js';
	import AttributeCard from '/imports/ui/properties/components/attributes/AttributeCard.vue';
	import AbilityListTile from '/imports/ui/properties/components/attributes/AbilityListTile.vue';
	import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
  import DamageMultiplierCard from '/imports/ui/properties/components/damageMultipliers/DamageMultiplierCard.vue';
  import HealthBarCardContainer from '/imports/ui/properties/components/attributes/HealthBarCardContainer.vue';
	import HitDiceListTile from '/imports/ui/properties/components/attributes/HitDiceListTile.vue';
	import SkillListTile from '/imports/ui/properties/components/skills/SkillListTile.vue';
	import ResourceCard from '/imports/ui/properties/components/attributes/ResourceCard.vue';
	import SpellSlotListTile from '/imports/ui/properties/components/attributes/SpellSlotListTile.vue';
  import ActionCard from '/imports/ui/properties/components/actions/ActionCard.vue';
  import RestButton from '/imports/ui/creature/RestButton.vue';
  import getActiveProperties from '/imports/api/creature/getActiveProperties.js';

  const getProperties = function(creature, filter,){
    if (!creature) return;
    if (creature.settings.hideUnusedStats){
      filter.hide = {$ne: true};
    }
    return getActiveProperties({
      ancestorId: creature._id,
      filter,
      options: {sort: {order: 1}},
    });
  };

	const getAttributeOfType = function(creature, type){
    return getProperties(creature, {
      type: 'attribute',
      attributeType: type,
    });
	};

  const getSkillOfType = function(creature, type){
    return getProperties(creature, {
      type: 'skill',
      skillType: type,
    });
  }

	export default {
		components: {
      RestButton,
			AbilityListTile,
			AttributeCard,
			ColumnLayout,
      DamageMultiplierCard,
			HealthBarCardContainer,
			HitDiceListTile,
			SkillListTile,
			ResourceCard,
			SpellSlotListTile,
      ActionCard,
		},
		props: {
			creatureId: {
        type: String,
        required: true,
      },
		},
		meteor: {
      creature(){
        return Creatures.findOne(this.creatureId);
      },
			abilities(){
				return getAttributeOfType(this.creature, 'ability');
			},
			stats(){
				return getAttributeOfType(this.creature, 'stat');
			},
			modifiers(){
				return getAttributeOfType(this.creature, 'modifier');
			},
			resources(){
				return getAttributeOfType(this.creature, 'resource');
			},
			spellSlots(){
				return getAttributeOfType(this.creature, 'spellSlot');
			},
			hitDice(){
        return getAttributeOfType(this.creature, 'hitDice');
			},
			checks(){
        return getSkillOfType(this.creature, 'check');
			},
			savingThrows(){
        return getSkillOfType(this.creature, 'save');
			},
			skills(){
        return getSkillOfType(this.creature, 'skill');
			},
      tools(){
        return getSkillOfType(this.creature, 'tool');
			},
      weapons(){
        return getSkillOfType(this.creature, 'weapon');
			},
      armors(){
        return getSkillOfType(this.creature, 'armor');
			},
      languages(){
        return getSkillOfType(this.creature, 'language');
			},
      actions(){
        return getProperties(this.creature, {type: 'action'});
			},
      appliedBuffs(){
        return getProperties(this.creature, {type: 'buff', applied: true});
			},
      attacks(){
        let props = getProperties(this.creature, {type: 'attack'}).map(attack => {
          attack.children = getActiveProperties({
            ancestorId: attack._id,
            options: {sort: {order: 1}},
          });
          return attack;
        });
        return props;
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
      numKeys(obj){
        if (!obj) return 0;
        return Object.keys(obj).length;
      },
      softRemove(_id){
        softRemoveProperty.call({_id}, error => {
          if (error) console.error(error);
        });
      }
		},
	};
</script>

<style lang="css" scoped>
</style>
