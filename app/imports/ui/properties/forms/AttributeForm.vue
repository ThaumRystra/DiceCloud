<template lang="html">
  <div class="attribute-form">
    <div class="layout column align-center">
      <computed-field
        ref="focusFirst"
        label="Base Value"
        class="base-value-field"
        hint="This is the value of the attribute before effects are applied. Can be a number or a calculation"
        style="width: 332px;"
        :model="model.baseValue"
        :error-messages="errors.baseValue"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['baseValue', ...path], value, ack})"
      />
    </div>
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Name"
          :value="model.name"
          :error-messages="errors.name"
          @change="change('name', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Variable name"
          :value="model.variableName"
          hint="Use this name in calculations to reference this attribute"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
    </v-row>
    <smart-select
      label="Type"
      :items="attributeTypes"
      :value="model.attributeType"
      :error-messages="errors.attributeType"
      :menu-props="{auto: true, lazy: true}"
      :hint="attributeTypeHints[model.attributeType]"
      @change="change('attributeType', ...arguments)"
    />
    <v-expand-transition>
      <smart-select
        v-if="model.attributeType === 'hitDice'"
        label="Hit Dice Size"
        :items="['d4', 'd6', 'd8', 'd10', 'd12', 'd20']"
        :value="model.hitDiceSize"
        :error-messages="errors.hitDiceSize"
        :menu-props="{auto: true, lazy: true}"
        @change="change('hitDiceSize', ...arguments)"
      />
      <computed-field
        v-if="model.attributeType === 'spellSlot'"
        label="Spell slot level"
        :model="model.spellSlotLevel"
        :error-messages="errors.spellSlotLevel"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['spellSlotLevel', ...path], value, ack})"
      />
    </v-expand-transition>
    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />
    <form-sections>
      <v-expand-transition>
        <form-section
          v-if="model.attributeType === 'healthBar'"
          name="Health Bar Settings"
          standalone
        >
          <color-picker
            :value="model.healthBarColorMid"
            label="Half-filled color"
            @input="value => $emit('change', {path: ['healthBarColorMid'], value})"
          />
          <color-picker
            :value="model.healthBarColorLow"
            label="Empty color"
            @input="value => $emit('change', {path: ['healthBarColorLow'], value})"
          />
        </form-section>
      </v-expand-transition>

      <form-section
        name="Advanced"
      >
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          hint="Used to let slots find this property in a library, should otherwise be left blank"
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
        <div class="layout column align-center">
          <smart-switch
            v-if="model.attributeType !== 'hitDice'"
            label="Allow decimal values"
            class="no-flex"
            :value="model.decimal"
            :error-messages="errors.decimal"
            @change="change('decimal', ...arguments)"
          />
          <div
            class="layout justify-center"
            style="align-self: stretch;"
          >
            <text-field
              label="Damage"
              type="number"
              class="damage-field text-center"
              style="max-width: 300px;"
              hint="The attribute's final value is reduced by this amount. Attribute damage can increase this value until it matches the attribute's computed value. Should mostly be left blank."
              :disabled="!context.isLibraryForm"
              :value="model.damage"
              :error-messages="errors.damage"
              @change="change('damage', ...arguments)"
            />
          </div>
        </div>
        <div class="layout wrap">
          <smart-select
            v-if="model.attributeType !== 'hitDice'"
            label="Reset"
            clearable
            style="flex-basis: 300px;"
            hint="When damage should be reset to zero"
            :items="resetOptions"
            :value="model.reset"
            :error-messages="errors.reset"
            :menu-props="{auto: true, lazy: true}"
            @change="change('reset', ...arguments)"
          />
        </div>
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
  import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';
	import FormSections from '/imports/ui/properties/forms/shared/FormSections.vue';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import ColorPicker from '/imports/ui/components/ColorPicker.vue';

	export default {
		components: {
			FormSection,
      FormSections,
      ColorPicker,
		},
    mixins: [propertyFormMixin],
    inject: {
      context: { default: {} }
    },
		data(){
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
      'model.attributeType': function(newVal, oldVal){
        if (newVal === 'hitDice' && !this.model.hitDiceSize){
          this.$emit('change', {path: ['hitDiceSize'], value: 'd8'});
        } else if (oldVal === 'hitDice'){
          this.$emit('change', {path: ['hitDiceSize'], value: undefined});
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
	.layout.row.wrap > *{
		margin-right: 8px;
	}
</style>
