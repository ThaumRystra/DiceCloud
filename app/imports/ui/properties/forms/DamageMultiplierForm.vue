<template lang="html">
  <div class="attribute-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          ref="focusFirst"
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
        <smart-select
          label="Value"
          style="flex-basis: 300px;"
          :items="values"
          :value="model.value"
          :error-messages="errors.value"
          :menu-props="{auto: true, lazy: true}"
          @change="change('value', ...arguments)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12">
        <smart-combobox
          label="Damage Types"
          multiple
          chips
          deletable-chips
          :rules="damageTypeRules"
          :items="DAMAGE_TYPES"
          :value="model.damageTypes"
          :error-messages="errors.damageTypes"
          :menu-props="{auto: true, lazy: true}"
          @update:error="error"
          @change="change('damageTypes', ...arguments)"
        />
      </v-col>
    </v-row>
    <form-sections>
      <form-section name="Children">
        <slot name="children" />
      </form-section>
      <form-section
        name="Advanced"
      >
        <smart-combobox
          label="Damage tags required"
          hint="This damage multiplier will only apply to damage that has all of these tags"
          multiple
          chips
          deletable-chips
          :items="['magical', 'silvered']"
          :value="model.includeTags"
          @change="change('includeTags', ...arguments)"
        />
        <smart-combobox
          label="Damage tags excluded"
          hint="Damage that includes any of these tags will bypass this damage multiplier"
          multiple
          chips
          deletable-chips
          :items="['magical', 'silvered']"
          :value="model.excludeTags"
          @change="change('excludeTags', ...arguments)"
        />
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          hint=""
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
  import FormSection, { FormSections } from '/imports/ui/properties/forms/shared/FormSection.vue';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';
  import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';

	export default {
		components: {
      FormSections,
			FormSection,
		},
    mixins: [propertyFormMixin],
		data(){return {
			DAMAGE_TYPES,
			values: [
        {
					value: 0,
					text: 'Immunity',
				}, {
					value: 0.5,
					text: 'Resistance',
				}, {
					value: 2,
					text: 'Vulnerability',
				},
			],
      damageTypeRules: [
        value => {
          if (value && value.length){
            for(let i = 0; i < value.length; i++){
              if (!VARIABLE_NAME_REGEX.test(value[i])){
                return `${value[i]} is not a valid damage name`
              }
            }
          }
        }
      ],
		};},
    methods: {
      error(e){
        console.log({e})
      }
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
