<template lang="html">
  <div class="attribute-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          :label="$t('properties.forms.common.variableName')"
          :value="model.variableName"
          :hint="$t('properties.forms.common.variableNameHint')"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          ref="focusFirst"
          :label="$t('properties.forms.common.baseValue')"
          class="base-value-field"
          :hint="$t('properties.forms.common.baseValueHint')"
          :model="model.baseValue"
          :error-messages="errors.baseValue"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['baseValue', ...path], value, ack})"
        />
      </v-col>
      <v-col cols="12">
        <smart-select
          :label="$t('properties.forms.common.type')"
          :items="attributeTypes"
          :value="model.attributeType"
          :error-messages="errors.attributeType"
          :menu-props="{auto: true, lazy: true}"
          :hint="attributeTypeHints[model.attributeType]"
          @change="change('attributeType', ...arguments)"
        />
      </v-col>
      <v-expand-transition>
        <v-col
          v-if="model.attributeType === 'hitDice'"
          cols="12"
        >
          <smart-select
            label="Hit Dice Size"
            :items="['d4', 'd6', 'd8', 'd10', 'd12', 'd20']"
            :value="model.hitDiceSize"
            :error-messages="errors.hitDiceSize"
            :menu-props="{auto: true, lazy: true}"
            @change="change('hitDiceSize', ...arguments)"
          />
        </v-col>
        <v-col
          v-if="model.attributeType === 'spellSlot'"
          cols="12"
        >
          <computed-field
            :label="$t('properties.forms.attributeForm.spellSlotLevel')"
            :model="model.spellSlotLevel"
            :error-messages="errors.spellSlotLevel"
            @change="({path, value, ack}) =>
              $emit('change', {path: ['spellSlotLevel', ...path], value, ack})"
          />
        </v-col>
      </v-expand-transition>
    </v-row>
    <inline-computation-field
      :label="$t('properties.forms.common.description')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />
    <form-sections type="attribute">
      <v-expand-transition>
        <form-section
          v-if="model.attributeType === 'healthBar'"
          :name="$t('properties.forms.attributeForm.healthBar')"
        >
          <div class="d-flex flex-column align-center mb-4">
            <div class="text-caption mb-4">
              {{ $t('properties.forms.attributeForm.damagedColors') }}
            </div>
            <div
              class="d-flex flex-wrap align-center justify-start"
            >
              <outlined-input
                :name="$t('properties.forms.attributeForm.half')"
                class="mb-4"
              >
                <color-picker
                  :value="model.healthBarColorMid"
                  :width="54"
                  :height="54"
                  @input="value => $emit('change', {path: ['healthBarColorMid'], value})"
                />
              </outlined-input>
              <outlined-input
                :name="$t('properties.forms.attributeForm.empty')"
                class="mb-4 ml-2"
              >
                <color-picker
                  :value="model.healthBarColorLow"
                  :width="54"
                  :height="54"
                  @input="value => $emit('change', {path: ['healthBarColorLow'], value})"
                />
              </outlined-input>
            </div>
          </div>
          <v-row dense>
            <v-col
              cols="12"
              md="4"
            >
              <text-field
                :label="$t('properties.forms.attributeForm.damageOrder')"
                type="number"
                :hint="$t('properties.forms.attributeForm.damageOrderHint')"
                :disabled="model.healthBarNoDamage"
                :value="model.healthBarDamageOrder"
                :error-messages="errors.healthBarDamageOrder"
                @change="change('healthBarDamageOrder', ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              sm="6"
            >
              <smart-switch
                :label="$t('properties.forms.attributeForm.ignoreDamage')"
                :value="model.healthBarNoDamage"
                :error-messages="errors.healthBarNoDamage"
                @change="change('healthBarNoDamage', ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              sm="6"
            >
              <smart-switch
                :label="$t('properties.forms.attributeForm.preventDamageOverflow')"
                :value="model.healthBarNoDamageOverflow"
                :error-messages="errors.healthBarNoDamageOverflow"
                @change="change('healthBarNoDamageOverflow', ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <text-field
                :label="$t('properties.forms.attributeForm.healingOrder')"
                type="number"
                :hint="$t('properties.forms.attributeForm.healingOrderHint')"
                :disabled="model.healthBarNoHealing"
                :value="model.healthBarHealingOrder"
                :error-messages="errors.healthBarHealingOrder"
                @change="change('healthBarHealingOrder', ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              sm="6"
            >
              <smart-switch
                :label="$t('properties.forms.attributeForm.ignoreHealing')"
                :value="model.healthBarNoHealing"
                :error-messages="errors.healthBarNoHealing"
                @change="change('healthBarNoHealing', ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
              sm="6"
            >
              <smart-switch
                :label="$t('properties.forms.attributeForm.preventHealingOverflow')"
                :value="model.healthBarNoHealingOverflow"
                :error-messages="errors.healthBarNoHealingOverflow"
                @change="change('healthBarNoHealingOverflow', ...arguments)"
              />
            </v-col>
          </v-row>
        </form-section>
      </v-expand-transition>
      <form-section name="Damage">
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              :label="$t('properties.forms.common.damage')"
              type="number"
              class="damage-field text-center"
              :hint="$t('properties.forms.common.damageHint')"
              :disabled="!context.isLibraryForm"
              :value="model.damage"
              :error-messages="errors.damage"
              @change="change('damage', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <reset-selector
              v-if="model.attributeType !== 'hitDice'"
              :hint="$t('properties.forms.attributeForm.resetHint')"
              :value="model.reset"
              :error-messages="errors.reset"
              @change="change('reset', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <form-section name="Behavior"> 
        <v-row dense>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              v-if="model.attributeType !== 'hitDice'"
              :label="$t('properties.forms.attributeForm.allowDecimalValues')"
              class="mx-4"
              :value="model.decimal"
              :error-messages="errors.decimal"
              @change="change('decimal', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('properties.forms.attributeForm.canBeDamagedNegative')"
              class="mx-4"
              :value="model.ignoreLowerLimit"
              :error-messages="errors.ignoreLowerLimit"
              @change="change('ignoreLowerLimit', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('properties.forms.attributeForm.canBeIncrementedAboveTotal')"
              class="mx-4"
              :value="model.ignoreUpperLimit"
              :error-messages="errors.ignoreUpperLimit"
              @change="change('ignoreUpperLimit', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('properties.forms.attributeForm.hideWhenTotalZero')"
              class="mx-4"
              :value="model.hideWhenTotalZero"
              :error-messages="errors.hideWhenTotalZero"
              @change="change('hideWhenTotalZero', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              :label="$t('properties.forms.attributeForm.hideWhenValueZero')"
              class="mx-4"
              :value="model.hideWhenValueZero"
              :error-messages="errors.hideWhenValueZero"
              @change="change('hideWhenValueZero', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import FormSections from '/imports/client/ui/properties/forms/shared/FormSections.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import ColorPicker from '/imports/client/ui/components/ColorPicker.vue';
import ResetSelector from '/imports/client/ui/components/ResetSelector.vue';
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';

export default {
  components: {
    FormSection,
    FormSections,
    OutlinedInput,
    ColorPicker,
    ResetSelector,
  },
  mixins: [propertyFormMixin],
  inject: {
    context: { default: {} }
  },
  data() {
    let data = {
      attributeTypes: [
        {
          text: 'Ability score',
          value: 'ability',
          help: 'Ability scores are your primary attributes, like Strength and Intelligence',
        }, {
          text: 'Stat',
          value: 'stat',
          help: 'Stats are attributes with a numerical value like speed or carrying capacity',
        }, {
          text: 'Modifier',
          value: 'modifier',
          help: 'Modifiers are attributes that are added to rolls, like proficiency bonus',
        }, {
          text: 'Hit dice',
          value: 'hitDice',
        }, {
          text: 'Health bar',
          value: 'healthBar',
        }, {
          text: 'Resource',
          value: 'resource',
          help: 'Resources are attributes that are spent to fuel actions, like sorcery points or ki'
        }, {
          text: 'Spell slot',
          value: 'spellSlot',
        }, {
          text: 'Utility',
          value: 'utility',
          help: 'Utility attributes aren\'t displayed on your character sheet, but can be referenced or used in calculations',
        },
      ],
      resetOptions: [
        {
          text: 'Short rest',
          value: 'shortRest',
        }, {
          text: 'Long rest',
          value: 'longRest',
        }
      ],
    };
    data.attributeTypeHints = {};
    data.attributeTypes.forEach(type => {
      data.attributeTypeHints[type.value] = type.help;
    });
    return data;
  },
  watch: {
    'model.attributeType': function (newVal, oldVal) {
      if (newVal === 'hitDice' && !this.model.hitDiceSize) {
        this.$emit('change', { path: ['hitDiceSize'], value: 'd8' });
      } else if (oldVal === 'hitDice') {
        this.$emit('change', { path: ['hitDiceSize'], value: undefined });
      }
    },
  }
};
</script>

<style lang="css" scoped>
.no-flex {
  flex: initial;
}

.layout.row.wrap {
  margin-right: -8px;
}

.layout.row.wrap>* {
  margin-right: 8px;
}
</style>
