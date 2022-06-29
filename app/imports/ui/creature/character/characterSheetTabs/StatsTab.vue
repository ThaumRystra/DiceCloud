<template lang="html">
  <div
    class="stats-tab ma-2"
  >
    <health-bar-card-container :creature-id="creatureId" />

    <column-layout>
      <div class="character-buttons">
        <v-card>
          <v-card-text class="layout column align-center">
            <rest-button
              :creature-id="creatureId"
              type="shortRest"
              class="ma-1"
            />
            <rest-button
              :creature-id="creatureId"
              type="longRest"
              class="ma-1"
            />
          </v-card-text>
        </v-card>
      </div>

      <damage-multiplier-card
        v-if="multipliers && multipliers.length"
        :multipliers="multipliers"
        @click-multiplier="clickProperty"
      />

      <div
        v-if="appliedBuffs.length"
        class="buffs"
      >
        <v-card>
          <v-list>
            <v-subheader>Buffs and conditions</v-subheader>
            <v-list-item
              v-for="buff in appliedBuffs"
              :key="buff._id"
              :data-id="buff._id"
              @click="clickProperty({_id: buff._id})"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ buff.name }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  icon
                  @click.stop="softRemove(buff._id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </div>

      <div
        v-if="abilities.length"
        class="ability-scores"
      >
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
        v-for="toggle in toggles"
        :key="toggle._id"
        class="toggle"
      >
        <toggle-card
          :model="toggle"
          :data-id="toggle._id"
          @click="clickProperty({_id: toggle._id})"
        />
      </div>

      <div
        v-for="stat in stats"
        :key="stat._id"
        class="stat"
      >
        <attribute-card
          :model="stat"
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
          :model="modifier"
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
          :model="check"
          :data-id="check._id"
          @click="clickProperty({_id: check._id})"
        />
      </div>

      <div
        v-if="hitDice.length"
        class="hit-dice"
      >
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
          :model="resource"
          :data-id="resource._id"
          @click="clickProperty({_id: resource._id})"
          @change="e => incrementChange(resource._id, e)"
        />
      </div>

      <div
        v-if="spellSlots && spellSlots.length || hasSpells"
        class="spell-slots"
      >
        <v-card
          data-id="spell-slot-card"
        >
          <v-list
            v-if="spellSlots && spellSlots.length"
            two-line
            subheader
          >
            <v-subheader>Spell Slots</v-subheader>
            <spell-slot-list-tile
              v-for="spellSlot in spellSlots"
              :key="spellSlot._id"
              :model="spellSlot"
              :data-id="spellSlot._id"
              @click="clickProperty({_id: spellSlot._id})"
              @cast="castSpellWithSlot(spellSlot._id)"
            />
          </v-list>
          <div
            v-if="hasSpells"
            class="d-flex justify-end"
          >
            <v-btn
              color="accent"
              style="width: 100%;"
              outlined
              @click="castSpell"
            >
              Cast a spell
            </v-btn>
          </div>
        </v-card>
      </div>

      <div
        v-if="savingThrows.length"
        class="saving-throws"
      >
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

      <div
        v-if="skills.length"
        class="skills"
      >
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
        class="action"
      >
        <action-card
          :model="action"
          :data-id="action._id"
          @click="clickProperty({_id: action._id})"
          @sub-click="_id => clickTreeProperty({_id})"
        />
      </div>
      <div
        v-for="attack in attacks"
        :key="attack._id"
        class="attack"
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

<script lang="js">
  import Creatures from '/imports/api/creature/creatures/Creatures.js';
	import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty.js';
  import damageProperty from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
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
  import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
  import ToggleCard from '/imports/ui/properties/components/toggles/ToggleCard.vue';
  import doCastSpell from '/imports/api/engine/actions/doCastSpell.js';
  import {snackbar} from '/imports/ui/components/snackbars/SnackbarQueue.js';

  const getProperties = function(creature, filter, options = {
    sort: {order: 1}
  }){
    if (!creature) return;
    if (creature.settings.hideUnusedStats){
      filter.hide = {$ne: true};
    }
    filter['ancestors.id'] = creature._id;
    filter.removed = {$ne: true};
    filter.inactive = {$ne: true};
    filter.overridden = {$ne: true};

    return CreatureProperties.find(filter, options);
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
      ToggleCard,
		},
		props: {
			creatureId: {
        type: String,
        required: true,
      },
		},
    data(){return {
      doCheckLoading: false,
    }},
		meteor: {
      creature(){
        return Creatures.findOne(this.creatureId, {fields: {settings: 1}});
      },
			abilities(){
				return getAttributeOfType(this.creature, 'ability');
			},
			stats(){
				return getAttributeOfType(this.creature, 'stat');
			},
      toggles(){
        return CreatureProperties.find({
          'ancestors.id': this.creatureId,
          type: 'toggle',
          removed: {$ne: true},
          deactivatedByAncestor: {$ne: true},
          showUI: true,
        }, {
          sort: {order: 1}
        });
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
      hasSpells(){
        return getProperties(this.creature, {
          type: 'spell',
        }).count();
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
        return getProperties(this.creature, {type: 'buff'});
			},
      multipliers(){
        return getProperties(this.creature, {
          type: 'damageMultiplier'
        }, {
          sort: {value: 1, order: 1}
        });
      },
      attacks(){
        let props = getProperties(this.creature, {type: 'attack'})
        return props && props.map(attack => {
          attack.children = CreatureProperties.find({
            'ancestors.id': attack._id,
            removed: {$ne: true},
            inactive: {$ne: true},
          }, {
            sort: {order: 1}
          });
          return attack;
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
      clickTreeProperty({_id}){
				this.$store.commit('pushDialogStack', {
					component: 'creature-property-dialog',
					elementId: `tree-node-${_id}`,
					data: {_id},
				});
			},
			incrementChange(_id, {type, value}){
				if (type === 'increment'){
					damageProperty.call({_id, operation: 'increment' ,value: -value});
				}
			},
      softRemove(_id){
        softRemoveProperty.call({_id}, error => {
          if (error) console.error(error);
        });
      },
      castSpell(){
        this.$store.commit('pushDialogStack', {
					component: 'cast-spell-with-slot-dialog',
					elementId: 'spell-slot-card',
					data: {
            creatureId: this.creatureId,
          },
          callback({spellId, slotId} = {}){
            if (!spellId) return;
            doCastSpell.call({spellId, slotId}, error => {
              if (!error) return;
              snackbar({text: error.reason || error.message || error.toString()});
              console.error(error);
            });
          },
				});
      }
		},
	};
</script>

<style lang="css" scoped>
</style>
