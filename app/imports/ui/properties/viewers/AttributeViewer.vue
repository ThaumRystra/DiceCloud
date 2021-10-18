<template lang="html">
  <div class="attribute-viewer">
    <v-row
      dense
      align="stretch"
      justify="center"
      justify-sm="start"
    >
      <property-field
        :name="model.damage !== undefined ? 'Value / Total': 'Value'"
        center
      >
        <v-spacer />
        <div
          class="text-h4 mr-3"
        >
          <div
            v-if="model.damage !== undefined"
          >
            {{ model.value }} / {{ model.total }}
          </div>
          <div v-else>
            {{ model.value }}
          </div>
        </div>
        <v-spacer />
        <increment-button
          v-if="context.creatureId"
          outlined
          icon
          tile
          color="primary"
          :value="model.value"
          @change="damageProperty"
        >
          <v-icon>
            $vuetify.icons.abacus
          </v-icon>
        </increment-button>
      </property-field>
      <property-field
        v-if="model.modifier !== undefined"
        name="Modifier"
        center
        :value="isFinite(model.modifier) ?
          numberToSignedString(model.modifier) :
          model.modifier"
      >
        <div class="text-h6">
          {{ numberToSignedString(model.modifier) }}
        </div>
      </property-field>
      <property-field
        name="Variable Name"
        :value="model.variableName"
      />
      <property-field
        name="Type"
        :value="attributeTypes[model.attributeType]"
      />
      <property-field
        v-if="model.attributeType === 'hitDice' && model.hitDiceSize"
        name="Hit dice size"
        :value="model.hitDiceSize"
      />
      <property-field
        v-if="model.attributeType === 'hitDice'"
        name="Constitution modifier"
        :value="isFinite(model.constitutionMod) ?
          numberToSignedString(model.constitutionMod) :
          model.constitutionMod"
      />
      <property-field
        v-if="model.attributeType === 'spellSlot' && model.spellSlotLevel"
        name="Spell slot level"
        :value="model.spellSlotLevel.value !== undefined ? model.spellSlotLevel.value : model.spellSlotLevel.calculation"
      />
      <property-field
        v-if="model.attributeType === 'ability' && model.proficiency !== undefined"
        name="Proficiency"
      >
        <v-icon
          style="height: 12px"
          class="ml-1 mr-2"
        >
          {{ proficiencyIcon }}
        </v-icon>
        <div>
          {{ proficiencyText[model.proficiency] }}
        </div>
      </property-field>
      <property-field
        v-if="reset && model.attributeType !== 'hitDice'"
        name="Reset"
        :value="reset"
      />
      <property-field
        v-if="model.overridden"
        :cols="{cols: 6, md: 12}"
        name="Overridden"
        value="Overriden by another property with the same variable name"
      />
    </v-row>
    <v-row dense>
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
    <v-row dense>
      <property-field
        v-if="baseEffects.length || effects.length"
        :cols="{col: 12}"
        name="Effects"
      >
        <v-list style="width: 100%;">
          <attribute-effect
            v-for="effect in baseEffects"
            :key="effect._id"
            :model="effect"
            :hide-breadcrumbs="effect._id === model._id"
            :data-id="effect._id"
            @click="effect._id !== model._id && clickEffect(effect._id)"
          />
          <attribute-effect
            v-for="effect in effects"
            :key="effect._id"
            :model="effect"
            :data-id="effect._id"
            @click="clickEffect(effect._id)"
          />
        </v-list>
      </property-field>
    </v-row>
  </div>
</template>

<script lang="js">
  import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
  import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
  import AttributeEffect from '/imports/ui/properties/components/attributes/AttributeEffect.vue';
  import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
  import damageProperty from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
  import IncrementButton from '/imports/ui/components/IncrementButton.vue';
  import getProficiencyIcon from '/imports/ui/utility/getProficiencyIcon.js';

  export default {
    components: {
      AttributeEffect,
      IncrementButton,
    },
    mixins: [propertyViewerMixin],
    inject: {
      context: { default: {} }
    },
    data(){return {
      attributeTypes: {
        ability: 'Ability score',
        stat: 'Stat',
        modifier: 'Modifier',
        hitDice: 'Hit dice',
        healthBar: 'Health bar',
        resource: 'Resource',
        spellSlot: 'Spell slot',
        utility: 'Utility',
      },
      proficiencyText: {
        0: 'Not proficient',
        1: 'Proficient',
        0.49: 'Half proficiency bonus rounded down',
        0.5: 'Half proficiency bonus rounded up',
        2: 'Double proficiency bonus',
      },
    }},
    computed: {
      reset(){
        let reset = this.model.reset
        if (reset === 'shortRest'){
          return 'Reset on a short rest';
        } else if (reset === 'longRest'){
          return 'Reset on a long rest';
        }
        return undefined;
      },
      proficiencyIcon(){
        return getProficiencyIcon(this.model.proficiency);
      },
    },
    methods: {
      numberToSignedString,
      clickEffect(id){
        this.$store.commit('pushDialogStack', {
          component: 'creature-property-dialog',
          elementId: `${id}`,
          data: {_id: id},
        });
      },
      damageProperty({type, value}) {
        damageProperty.call({
          _id: this.model._id,
          operation: type,
          value: value
        });
      },
    },
    meteor: {
      baseEffects(){
        if (this.context.creatureId && this.model.variableName){
          let creatureId = this.context.creatureId;
          return CreatureProperties.find({
            'ancestors.id': creatureId,
            type: 'attribute',
            variableName: this.model.variableName,
            removed: {$ne: true},
            inactive: {$ne: true},
          }).map( prop => ({
            _id: prop._id,
            name: 'Attribute base value',
            operation: 'base',
            amount: prop.baseValue,
            stats: [prop.variableName],
            ancestors: prop.ancestors,
          }) ).filter(effect => effect.amount);
        } else {
          return [];
        }
      },
      effects(){
        if (this.context.creatureId && this.model.variableName){
          let creatureId = this.context.creatureId;
          return CreatureProperties.find({
            'ancestors.id': creatureId,
            'stats': this.model.variableName,
            removed: {$ne: true},
            inactive: {$ne: true},
          });
        } else {
          return [];
        }
      },
    },
  }
</script>

<style lang="css" scoped>
  .ability-value {
    font-weight: 600;
    font-size: 24px !important;
    color: rgba(0, 0, 0, 0.54);
  }
  .mod, .ability-value {
    text-align: center;
    width: 100%;
  }
  .attribute-value {
    text-align: center;
  }
</style>
