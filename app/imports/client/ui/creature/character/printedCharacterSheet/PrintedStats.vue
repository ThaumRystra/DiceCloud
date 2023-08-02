<template lang="html">
  <div class="stats">
    <column-layout>
      <div
        v-for="ability in abilities"
        :key="ability._id"
      >
        <div
          class="ability"
        >
          <div class="score">
            <div class="double-border top big-number">
              <template v-if="creature.settings.swapScoresAndMods">
                {{ ability.total }}
              </template>
              <template v-else>
                {{ numberToSignedString(ability.modifier) }}
              </template>
            </div>
            <div class="bottom">
              <template v-if="creature.settings.swapScoresAndMods">
                {{ numberToSignedString(ability.modifier) }}
              </template>
              <template v-else>
                {{ ability.total }}
              </template>
            </div>
          </div>
          <div class="double-border name label">
            {{ ability.name }}
          </div>
        </div>
      </div>

      <div
        v-for="toggle in toggles"
        :key="toggle._id"
      >
        <div
          class="number-label"
        >
          <div class="box double-border" />
          <div class="label double-border">
            {{ toggle.name }}
          </div>
        </div>
      </div>

      <div
        v-for="stat in stats"
        :key="stat._id"
      >
        <div
          class="number-label"
          :class="stat.variableName == 'armor' && 'shield-number-label'"
        >
          <div
            :class="stat.variableName == 'armor' ? 'shield-border' : 'octagon-border'"
            class="number big-number"
          >
            {{ stat.value }}
          </div>
          <div class="label double-border">
            {{ stat.name }}
          </div>
        </div>
      </div>

      <div
        v-for="modifier in modifiers"
        :key="modifier._id"
      >
        <div
          class="number-label"
        >
          <div class="number octagon-border big-number">
            {{ numberToSignedString(modifier.value) }}
          </div>
          <div class="label double-border">
            {{ modifier.name }}
          </div>
        </div>
      </div>

      <div
        v-for="check in checks"
        :key="check._id"
      >
        <div
          class="number-label"
        >
          <div class="number octagon-border big-number">
            {{ numberToSignedString(check.value) }}
          </div>
          <div class="label double-border">
            {{ check.name }}
          </div>
        </div>
      </div>
      <div
        v-for="healthBar in healthBars"
        :key="healthBar._id"
      >
        <div class="double-border">
          <div class="label">
            Total: {{ healthBar.total }}
          </div>
          <div style="height: 60px;" />
          <div
            style="text-align: center;"
            class="label"
          >
            {{ healthBar.name }}
          </div>
        </div>
      </div>
      <div v-if="multipliers && multipliers.length">
        <printed-damage-multipliers
          class="double-border"
          :multipliers="multipliers"
        />
      </div>
      <div
        v-if="hitDice.length"
      >
        <div class="double-border">
          <div>
            <span class="label">
              Total:
            </span>
            <span
              v-for="hitDie in hitDice"
              :key="hitDie._id"
              style="margin-right: 4px;"
            >
              {{ hitDie.total }}{{ hitDie.hitDiceSize }}
            </span>
          </div>
          <div style="height: 60px;" />
          <div
            style="text-align: center;"
            class="label"
          >
            Hit Dice
          </div>
        </div>
      </div>

      <div
        v-for="resource in resources"
        :key="resource._id"
      >
        <div
          class="double-border"
          :class="resource.total <= 8 && 'mb-2'"
        >
          <div
            v-if="resource.total <= 8"
            class="label"
          >
            {{ resource.name }}
          </div>
          <div
            v-if="resource.total > 8"
          >
            total: {{ resource.total }}
            <div style="height: 60px;" />
          </div>
          <div
            v-if="resource.total <= 8"
            class="d-flex justify-end"
          >
            <div
              v-for="i in resource.total"
              :key="i"
              class="resource-bubble"
            />
          </div>
          <div
            v-if="resource.total > 8"
            class="label text-center"
          >
            {{ resource.name }}
          </div>
        </div>
      </div>

      <div
        v-if="spellSlots && spellSlots.length"
      >
        <div class="double-border">
          <div class="label text-center">
            Spell Slots
          </div>
          <div
            v-for="spellSlot in spellSlots"
            :key="spellSlot._id"
            class="mb-7"
            :class="spellSlot.total <= 8 && 'mb-7'"
          >
            <div class="label">
              {{ spellSlot.name }}
            </div>
            <div
              v-if="spellSlot.total > 8"
            >
              Total: {{ spellSlot.total }}
            </div>
            <div
              v-else
              class="d-flex"
            >
              <div
                v-for="i in spellSlot.total"
                :key="i"
                class="resource-bubble"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="savingThrows.length"
      >
        <div
          class="double-border"
        >
          <printed-skill
            v-for="save in savingThrows"
            :key="save._id"
            :model="save"
            :data-id="save._id"
          />
          <div class="label text-center">
            Saving Throws
          </div>
        </div>
      </div>

      <div
        v-if="skills.length"
      >
        <div
          class="double-border"
        >
          <printed-skill
            v-for="skill in skills"
            :key="skill._id"
            :model="skill"
            :data-id="skill._id"
          />
          <div class="label text-center">
            Skills
          </div>
        </div>
      </div>
      <div
        v-if="weapons && weapons.length"
      >
        <div
          class="double-border"
        >
          <printed-skill
            v-for="weapon in weapons"
            :key="weapon._id"
            hide-modifier
            :model="weapon"
            :data-id="weapon._id"
          />
          <div class="label text-center">
            Weapons
          </div>
        </div>
      </div>
      <div
        v-if="armors && armors.length"
      >
        <div
          class="double-border"
        >
          <printed-skill
            v-for="armor in armors"
            :key="armor._id"
            hide-modifier
            :model="armor"
            :data-id="armor._id"
          />
          <div class="label text-center">
            Armor
          </div>
        </div>
      </div>
      <div
        v-if="tools && tools.length"
      >
        <div
          class="double-border"
        >
          <printed-skill
            v-for="tool in tools"
            :key="tool._id"
            hide-modifier
            :model="tool"
            :data-id="tool._id"
          />
          <div class="label text-center">
            Tools
          </div>
        </div>
      </div>
      <div
        v-if="languages && languages.length"
      >
        <div
          class="double-border"
        >
          <printed-skill
            v-for="language in languages"
            :key="language._id"
            hide-modifier
            :model="language"
            :data-id="language._id"
          />
          <div class="label text-center">
            Languages
          </div>
        </div>
      </div>

      <div
        v-for="note in notes"
        :key="note._id"
      >
        <div class="double-border">
          <div class="label text-center">
            {{ note.name }}
          </div>
          <property-description
            text
            :model="note.summary"
          />
        </div>
      </div>

      <div
        v-for="action in actions"
        :key="action._id"
      >
        <div class="double-border">
          <printed-action
            :model="action"
          />
        </div>
      </div>

      <div
        v-for="feature in features"
        :key="feature._id"
      >
        <div class="double-border">
          <div class="label text-center">
            {{ feature.name }}
          </div>
          <property-description
            text
            :model="feature.summary"
          />
        </div>
      </div>
    </column-layout>
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import PrintedAction from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedAction.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import numberToSignedString from '../../../../../api/utility/numberToSignedString.js';
import PrintedSkill from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedSkill.vue';
import PrintedDamageMultipliers from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedDamageMultipliers.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';

const getProperties = function (creature, filter, options = {
  sort: { order: 1 }
}) {
  if (!creature) return;
  if (creature.settings.hideUnusedStats) {
    filter.hide = { $ne: true };
  }
  filter['ancestors.id'] = creature._id;
  filter.removed = { $ne: true };
  filter.inactive = { $ne: true };
  filter.overridden = { $ne: true };
  filter.$nor = [
    { hideWhenTotalZero: true, total: 0 },
    { hideWhenValueZero: true, value: 0 },
  ];

  return CreatureProperties.find(filter, options);
};

const getAttributeOfType = function (creature, type) {
  return getProperties(creature, {
    type: 'attribute',
    attributeType: type,
  });
};

const getSkillOfType = function (creature, type) {
  return getProperties(creature, {
    type: 'skill',
    skillType: type,
  });
}

export default {
  components: {
    ColumnLayout,
    PrintedDamageMultipliers,
    PrintedAction,
    PrintedSkill,
    PropertyDescription,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      doCheckLoading: false,
    }
  },
  meteor: {
    creature() {
      return Creatures.findOne(this.creatureId, { fields: { settings: 1 } });
    },
    abilities() {
      return getAttributeOfType(this.creature, 'ability');
    },
    stats() {
      return getAttributeOfType(this.creature, 'stat');
    },
    toggles() {
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'toggle',
        removed: { $ne: true },
        deactivatedByAncestor: { $ne: true },
        deactivatedByToggle: { $ne: true },
        showUI: true,
      }, {
        sort: { order: 1 }
      });
    },
    healthBars() {
      return getAttributeOfType(this.creature, 'healthBar');
    },
    modifiers() {
      return getAttributeOfType(this.creature, 'modifier');
    },
    resources() {
      return getAttributeOfType(this.creature, 'resource');
    },
    spellSlots() {
      return getAttributeOfType(this.creature, 'spellSlot');
    },
    hasSpells() {
      const cursor = getProperties(this.creature, {
        type: 'spell',
      })
      return cursor && cursor.count();
    },
    hitDice() {
      return getAttributeOfType(this.creature, 'hitDice');
    },
    checks() {
      return getSkillOfType(this.creature, 'check');
    },
    savingThrows() {
      return getSkillOfType(this.creature, 'save');
    },
    skills() {
      return getSkillOfType(this.creature, 'skill');
    },
    tools() {
      return getSkillOfType(this.creature, 'tool');
    },
    weapons() {
      return getSkillOfType(this.creature, 'weapon');
    },
    armors() {
      return getSkillOfType(this.creature, 'armor');
    },
    languages() {
      return getSkillOfType(this.creature, 'language');
    },
    actions() {
      return getProperties(this.creature, { type: 'action' }, {
        sort: { actionType: 1, order: 1 }
      });
    },
    appliedBuffs() {
      return getProperties(this.creature, { type: 'buff' });
    },
    multipliers() {
      return getProperties(this.creature, {
        type: 'damageMultiplier'
      }, {
        sort: { value: 1, order: 1 }
      });
    },
    features() {
      return getProperties(this.creature, { type: 'feature' });
    },
    notes(){
      return getProperties(this.creature, { type: 'note', summary: {$exists: true} });
    },
  },
  methods: {
    numberToSignedString,
  },
};
</script>

<style lang="css" scoped>
.shield-border {
  min-width: 64px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  aspect-ratio: 0.87;
  padding: 12px;
  background: url(/images/print/shieldBorder.png);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
.shield-number-label {
  align-items: center !important;
}
.big-number {
  font-size: 20pt;
}
.ability {
  display: flex;
  align-items: start;
  margin: 4px 0;
}
.ability .score {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ability .top {
  min-width: 64px;
  text-align: center;
  margin-bottom: -10px;
  padding: 14px;
  z-index: 1;
}
.ability .bottom {
  font-size: 10pt;
  position: relative;
  padding: 0 16px;
  border: solid white;
  border-image-source: url(/images/print/upwardPointingBorder.png);
  border-image-slice: 0 85 fill;
  border-image-width: 0 16px;
  border-image-outset: 0px 0px;
  border-image-repeat: stretch;
  z-index: 2;
}
.ability .name {
  margin-top: 10px;
  margin-left: -16px;
  padding-left: 20px;
}

.number-label {
  display: flex;
  align-items: flex-start;
}

.label {
  font-size: 10pt;
  font-variant: small-caps;
  flex-grow: 1;
}

.number-label .label {
  margin-top: 4px;
  margin-left: -30px;
  padding-left: 34px;
}

.number-label .number {
  min-width: 72px;
  text-align: center;
  z-index: 1;
}

.number-label .box {
  width: 48px;
  height: 48px;
  margin-left: 10px;
  z-index: 1;
}

.resource-bubble {
  margin-bottom: -20px;
  margin-top: 4px;
  margin-right: 4px;
  background-color: white;
  border: solid black 2px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
}
</style>
