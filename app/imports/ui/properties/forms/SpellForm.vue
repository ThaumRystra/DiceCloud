<template lang="html">
  <div class="spell-form">
    <div class="layout row wrap justify-space-between">
      <smart-switch
        label="Prepared"
        style="width: 200px; flex-grow: 0;"
        class="mx-2"
        :value="model.prepared"
        :error-messages="errors.prepared"
        @change="change('prepared', ...arguments)"
      />
      <smart-switch
        label="Always prepared"
        style="width: 200px; flex-grow: 0;"
        class="mx-2"
        :value="model.alwaysPrepared"
        :error-messages="errors.alwaysPrepared"
        @change="change('alwaysPrepared', ...arguments)"
      />
    </div>
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <div class="layout row wrap">
      <smart-select
        label="Level"
        class="mx-1"
        style="flex-basis: 300px;"
        :items="spellLevels"
        :value="model.level"
        :error-messages="errors.level"
        @change="change('level', ...arguments)"
      />
      <smart-select
        label="School"
        class="mx-1"
        style="flex-basis: 300px;"
        :items="magicSchools"
        :value="model.school"
        :error-messages="errors.school"
        @change="change('school', ...arguments)"
      />
    </div>
    <text-field
      label="Casting Time"
      :value="model.castingTime"
      :error-messages="errors.castingTime"
      @change="change('castingTime', ...arguments)"
    />
    <text-field
      label="Range"
      :value="model.range"
      :error-messages="errors.range"
      @change="change('range', ...arguments)"
    />
    <div class="layout row wrap justify-space-between">
      <smart-checkbox
        label="Verbal"
        :value="model.verbal"
        :error-messages="errors.verbal"
        @change="change('verbal', ...arguments)"
      />
      <smart-checkbox
        label="Somatic"
        :value="model.somatic"
        :error-messages="errors.somatic"
        @change="change('somatic', ...arguments)"
      />
      <smart-checkbox
        label="Concentration"
        :value="model.concentration"
        :error-messages="errors.concentration"
        @change="change('concentration', ...arguments)"
      />
      <smart-checkbox
        label="Ritual"
        :value="model.ritual"
        :error-messages="errors.ritual"
        @change="change('ritual', ...arguments)"
      />
    </div>
    <text-field
      label="Material"
      :value="model.material"
      :error-messages="errors.material"
      @change="change('material', ...arguments)"
    />
    <text-field
      label="Duration"
      :value="model.duration"
      :error-messages="errors.duration"
      @change="change('duration', ...arguments)"
    />
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      @change="change('description', ...arguments)"
    />
    <form-sections>
      <form-section
        name="Casting"
      >
        <action-form
          v-bind="$props"
          v-on="$listeners"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script>
	import FormSection, { FormSections } from '/imports/ui/properties/forms/shared/FormSection.vue';
  import ActionForm from '/imports/ui/properties/forms/ActionForm.vue'
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

	export default {
		components: {
      FormSections,
			FormSection,
      ActionForm,
		},
    mixins: [propertyFormMixin],
		data(){return {
			magicSchools: [
				{
					text: 'Abjuration',
					value: 'abjuration',
				}, {
					text: 'Conjuration',
					value: 'conjuration',
				}, {
					text: 'Divination',
					value: 'divination',
				}, {
					text: 'Enchantment',
					value: 'enchantment',
				}, {
					text: 'Evocation',
					value: 'evocation',
				}, {
					text: 'Illusion',
					value: 'illusion',
				}, {
					text: 'Necromancy',
					value: 'necromancy',
				}, {
					text: 'Transmutation',
					value: 'transmutation',
				},
			],
			spellLevels: [
				{
					text: 'Cantrip',
					value: 0,
				}, {
					text: 'Level 1',
					value: 1,
				}, {
					text: 'Level 2',
					value: 2,
				}, {
					text: 'Level 3',
					value: 3,
				}, {
					text: 'Level 4',
					value: 4,
				}, {
					text: 'Level 5',
					value: 5,
				}, {
					text: 'Level 6',
					value: 6,
				}, {
					text: 'Level 7',
					value: 7,
				}, {
					text: 'Level 8',
					value: 8,
				}, {
					text: 'Level 9',
					value: 9,
				},
			],
		};},
	};
</script>

<style lang="css" scoped>
	.v-input--checkbox {
		flex-grow: 0;
		width: 200px;
	}
</style>
