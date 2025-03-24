<template lang="html">
  <div
    v-if="properties"
    class="stats-tab ma-2"
  >
    <div
      v-if="properties.attribute.healthBar && properties.attribute.healthBar.length"
      class="px-2 pt-2"
    >
      <v-card class="pa-2">
        <health-bar
          v-for="healthBar in properties.attribute.healthBar"
          :key="healthBar._id"
          :model="healthBar"
          @change="({ type, value }) => incrementChange(healthBar._id, { type, value })"
          @click="clickProperty({_id: healthBar._id})"
        />
      </v-card>
    </div>

    <column-layout>
      <folder-group-card
        v-for="folder in properties.folder.start"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />
      <div
        v-if="!creature.settings.hideRestButtons || (properties.action && properties.action.event && properties.action.event.length)"
        class="character-buttons"
      >
        <v-card>
          <v-card-text class="layout column align-center">
            <rest-button
              v-if="!creature.settings.hideRestButtons"
              :creature-id="creatureId"
              type="shortRest"
              class="ma-1"
            />
            <rest-button
              v-if="!creature.settings.hideRestButtons"
              :creature-id="creatureId"
              type="longRest"
              class="ma-1"
            />
            <event-button
              v-for="event in properties.event"
              :key="event._id"
              :model="event"
              class="ma-1"
            />
          </v-card-text>
        </v-card>
      </div>

      <folder-group-card
        v-for="folder in properties.folder.events"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />

      <damage-multiplier-card
        v-if="properties.damageMultiplier && properties.damageMultiplier.length"
        :multipliers="properties.damageMultiplier"
        @click-multiplier="clickProperty"
      />

      <div
        v-if="properties.buff && properties.buff.length"
        class="buffs"
      >
        <v-card>
          <v-list>
            <v-subheader>Buffs and conditions</v-subheader>
            <buff-list-item
              v-for="buff in properties.buff"
              :key="buff._id"
              :data-id="buff._id"
              :model="buff"
              @click="clickProperty({_id: buff._id})"
              @remove="softRemove(buff._id)"
            />
          </v-list>
        </v-card>
      </div>

      <div
        v-if="properties.attribute.ability && properties.attribute.ability.length"
        class="ability-scores"
      >
        <v-card>
          <v-list>
            <template v-for="(ability, index) in properties.attribute.ability">
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
        v-for="toggle in properties.toggle"
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
        v-for="stat in properties.attribute.stat"
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
        v-for="modifier in properties.attribute.modifier"
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
        v-for="check in properties.skill.check"
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
        v-if="properties.attribute.hitDice && properties.attribute.hitDice.length"
        class="hit-dice"
      >
        <v-card>
          <v-list>
            <v-subheader>Hit Dice</v-subheader>
            <template v-for="(hitDie, index) in properties.attribute.hitDice">
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
        v-for="resource in properties.attribute.resource"
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
        v-if="properties.attribute.spellSlot && properties.attribute.spellSlot.length"
        class="spell-slots"
      >
        <spell-slot-card
          :creature-id="creatureId"
          :spell-slots="properties.attribute.spellSlot"
        />
      </div>

      <folder-group-card
        v-for="folder in properties.folder.stats"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />

      <div
        v-if="properties.skill.save && properties.skill.save.length"
        class="saving-throws"
      >
        <v-card>
          <v-list>
            <v-subheader>Saving Throws</v-subheader>
            <skill-list-tile
              v-for="save in properties.skill.save"
              :key="save._id"
              :model="save"
              :data-id="save._id"
              @click="clickProperty({_id: save._id})"
            />
            <v-list-item
              v-for="(effect, index) in saveConditionals"
              :key="effect._id"
              :data-id="effect._id"
              :class="{'mt-2': !index}"
              @click="clickProperty({_id: effect._id})"
            >
              <v-list-item-content>
                <v-list-item-subtitle style="white-space: unset;">
                  {{ effect.text }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </div>

      <div
        v-if="properties.skill.skill && properties.skill.skill.length"
        class="skills"
      >
        <v-card>
          <v-list>
            <v-subheader>Skills</v-subheader>
            <skill-list-tile
              v-for="skill in properties.skill.skill"
              :key="skill._id"
              :model="skill"
              :data-id="skill._id"
              @click="clickProperty({_id: skill._id})"
            />
            <v-list-item
              v-for="(effect, index) in skillConditionals"
              :key="effect._id"
              :data-id="effect._id"
              :class="{'mt-2': !index}"
              @click="clickProperty({_id: effect._id})"
            >
              <v-list-item-content>
                <v-list-item-subtitle style="white-space: unset;">
                  {{ effect.text }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </div>

      <folder-group-card
        v-for="folder in properties.folder.skills"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />

      <div
        v-if="properties.skill.weapon && properties.skill.weapon.length"
        class="weapon-proficiencies"
      >
        <v-card>
          <v-list>
            <v-subheader>
              Weapons
            </v-subheader>
            <skill-list-tile
              v-for="weapon in properties.skill.weapon"
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
        v-if="properties.skill.armor && properties.skill.armor.length"
        class="armor-proficiencies"
      >
        <v-card>
          <v-list>
            <v-subheader>
              Armor
            </v-subheader>
            <skill-list-tile
              v-for="armor in properties.skill.armor"
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
        v-if="properties.skill.tool && properties.skill.tool.length"
        class="tool-proficiencies"
      >
        <v-card>
          <v-list>
            <v-subheader>
              Tools
            </v-subheader>
            <skill-list-tile
              v-for="tool in properties.skill.tool"
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
        v-if="properties.skill.language && properties.skill.language.length"
        class="language-proficiencies"
      >
        <v-card>
          <v-list>
            <v-subheader>
              Languages
            </v-subheader>
            <skill-list-tile
              v-for="language in properties.skill.language"
              :key="language._id"
              hide-modifier
              :model="language"
              :data-id="language._id"
              @click="clickProperty({_id: language._id})"
            />
          </v-list>
        </v-card>
      </div>

      <folder-group-card
        v-for="folder in properties.folder.proficiencies"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />

      <folder-group-card
        v-for="folder in properties.folder.end"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />
    </column-layout>
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty';
import HealthBar from '/imports/client/ui/properties/components/attributes/HealthBar.vue';
import AttributeCard from '/imports/client/ui/properties/components/attributes/AttributeCard.vue';
import AbilityListTile from '/imports/client/ui/properties/components/attributes/AbilityListTile.vue';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import DamageMultiplierCard from '/imports/client/ui/properties/components/damageMultipliers/DamageMultiplierCard.vue';
import HitDiceListTile from '/imports/client/ui/properties/components/attributes/HitDiceListTile.vue';
import SkillListTile from '/imports/client/ui/properties/components/skills/SkillListTile.vue';
import ResourceCard from '/imports/client/ui/properties/components/attributes/ResourceCard.vue';
import RestButton from '/imports/client/ui/creature/RestButton.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import ToggleCard from '/imports/client/ui/properties/components/toggles/ToggleCard.vue';
import BuffListItem from '/imports/client/ui/properties/components/buffs/BuffListItem.vue';
import SpellSlotCard from '/imports/client/ui/properties/components/attributes/SpellSlotCard.vue';
import EventButton from '/imports/client/ui/properties/components/actions/EventButton.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import FolderGroupCard from '/imports/client/ui/properties/components/folders/FolderGroupCard.vue';
import { get, set, uniqBy } from 'lodash';
import { docsToForest } from '/imports/api/parenting/parentingFunctions';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import doAction from '/imports/client/ui/creature/actions/doAction';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';

function walkDown(forest, callback){
  let stack = [...forest].reverse();
  while(stack.length){
    let node = stack.pop();
    const { skipChildren } = callback(node) ?? { skipChildren: false };
    if (!skipChildren) {
      stack.push(...[...node.children].reverse());
    }
  }
}

const propertyHandlers = {
  folder(prop) {
    let propPath = null;
    if (prop.groupStats && prop.tab === 'stats') {
      propPath = ['folder', prop.location]
    }
    return { propPath }
  },
  attribute(prop) {
    if (
      prop.attributeType === 'utility' ||
      prop.overridden ||
      (prop.hideWhenTotalZero && prop.total === 0) ||
      (prop.hideWhenValueZero && prop.value === 0)
    ) return { propPath: null };
    return {
      propPath: ['attribute', prop.attributeType],
    }
  },
  skill(prop) {
    if (
      prop.skillType === 'utility'
    ) return { propPath: null };
    return {
      propPath: ['skill', prop.skillType],
    }
  },
  toggle(prop) {
    if (
      prop.deactivatedByToggle || prop.deactivatedByAncestor || !prop.showUI
    ) return { propPath: null };
    return { propPath: 'toggle' };
  },
  action(prop) {
    if (prop.actionType === 'event' && !prop.overridden) {
      return { propPath: 'event' };
    }
    return { propPath: null };
  },
}

export default {
  components: {
    HealthBar,
    RestButton,
    BuffListItem,
    AbilityListTile,
    AttributeCard,
    ColumnLayout,
    DamageMultiplierCard,
    HitDiceListTile,
    SkillListTile,
    ResourceCard,
    SpellSlotCard,
    ToggleCard,
    EventButton,
    FolderGroupCard,
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
  computed: {
    saveConditionals(){
      const conditionals = [];
      this.properties.skill?.save?.forEach(prop => {
        prop?.effects?.forEach(effect => {
          if (effect.operation === 'conditional') {
            conditionals.push(effect);
          }
        });
      });
      return uniqBy(conditionals, '_id');
    },
    skillConditionals(){
      const conditionals = [];
      this.properties.skill?.skill?.forEach(prop => {
        prop?.effects?.forEach(effect => {
          if (effect.operation === 'conditional') {
            conditionals.push(effect);
          }
        });
      });
      return uniqBy(conditionals, '_id');
    },
  },
  meteor: {
    properties() {
      const creature = this.creature;
      if (!creature) return;
      const folderIds = CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        type: 'folder',
        groupStats: true,
        hideStatsGroup: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, { fields: { _id: 1 } }).map(folder => folder._id);

      const filter = {
        ...getFilter.descendantsOfRoot(this.creatureId),
        parentId: {
          $nin: folderIds,
        },
        $or: [
          { inactive: { $ne: true } },
          { type: 'toggle' },
        ],
        overridden: {$ne: true},
        removed: { $ne: true },
        type: {
          $in: [
            'action',
            'attribute',
            'buff',
            'damageMultiplier',
            'folder',
            'skill',
            'toggle',
          ]
        }
      };
      if (creature.settings.hideUnusedStats) {
        filter.hide = { $ne: true };
      }
      const allProps = CreatureProperties.find(filter, { sort: { left: 1 } }).fetch();
      const forest = docsToForest(allProps);
      const properties = { folder: {}, attribute: {}, skill: {} };
      walkDown(forest, node => {
        const prop = node.doc
        const { propPath, skipChildren } = propertyHandlers[prop.type]?.(prop) ||
          { propPath: prop.type };
        if (propPath) {
          let propArray = get(properties, propPath);
          if (!propArray) {
            propArray = [];
            set(properties, propPath, propArray);
          }
          propArray.push(prop);
        }
        return { skipChildren };
      });
      properties.damageMultiplier?.sort((a, b) => a.value - b.value);
      return properties;
    },
    creature() {
      return Creatures.findOne(this.creatureId, { fields: { settings: 1 } });
    },
    
    toggles() {
      return CreatureProperties.find({
        type: 'toggle',
        ...getFilter.descendantsOfRoot(this.creatureId),
        removed: { $ne: true },
        deactivatedByAncestor: { $ne: true },
        deactivatedByToggle: { $ne: true },
        showUI: true,
      }, {
        sort: { left: 1 }
      });
    },
  },
  methods: {
    clickProperty({ _id }) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${_id}`,
        data: { _id },
      });
    },
    clickTreeProperty({ _id }) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `tree-node-${_id}`,
        data: { _id },
      });
    },
    incrementChange(_id, { type, value, ack }) {
      const model = CreatureProperties.findOne(_id);
      if (type === 'increment') value = -value;
      doAction({
        creatureId: model.root.id,
        $store: this.$store,
        elementId: `${model._id}-${type}`,
        task: {
          subtaskFn: 'damageProp',
          targetIds: [model.root.id],
          params: {
            title: getPropertyTitle(model),
            operation: type,
            value,
            targetProp: model,
          },
        },
      }).then(() =>{
        ack?.();
      }).catch((error) => {
        if (ack) {
          ack(error);
        } else  {
          snackbar({ text: error.reason || error.message || error.toString() });
          console.error(error);
        }
      });
    },
    softRemove(_id) {
      softRemoveProperty.call({ _id }, error => {
        if (error) {
          snackbar({ text: error.reason || error.message || error.toString() });
          console.error(error);
        }
      });
    },
  },
};
</script>
