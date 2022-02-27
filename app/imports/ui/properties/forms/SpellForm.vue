<template lang="html">
  <div class="spell-form">
    <v-row
      justify="center"
      class="mb-3"
    >
      <v-col cols="12">
        <icon-color-menu
          :model="model"
          :errors="errors"
          @change="e => $emit('change', e)"
        />
      </v-col>
    </v-row>
    <div class="layout wrap justify-space-between">
      <smart-switch
        label="Always prepared"
        style="width: 200px; flex-grow: 0;"
        class="mx-2"
        :value="model.alwaysPrepared"
        :error-messages="errors.alwaysPrepared"
        @change="change('alwaysPrepared', ...arguments)"
      />
      <smart-switch
        v-show="!model.alwaysPrepared"
        label="Prepared"
        style="width: 200px; flex-grow: 0;"
        class="mx-2"
        :value="model.prepared"
        :error-messages="errors.prepared"
        @change="change('prepared', ...arguments)"
      />
      <smart-switch
        v-show="model.level"
        label="Cast without spell slots"
        style="width: 400px; flex-grow: 0;"
        class="mx-2"
        :value="model.castWithoutSpellSlots"
        :error-messages="errors.castWithoutSpellSlots"
        @change="change('castWithoutSpellSlots', ...arguments)"
      />
    </div>
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <div class="layout wrap">
      <smart-select
        label="Level"
        class="mx-1"
        style="flex-basis: 300px;"
        hint="The spell level"
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
    <smart-select
      label="Target"
      style="flex-basis: 300px;"
      :items="targetOptions"
      :value="model.target"
      :error-messages="errors.target"
      :menu-props="{auto: true, lazy: true}"
      @change="change('target', ...arguments)"
    />
    <div class="layout wrap justify-space-between">
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

    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />
    <form-sections>
      <form-section name="Resources">
        <resources-form
          :model="model.resources"
          @change="({path, value, ack}) => $emit('change', {path: ['resources', ...path], value, ack})"
          @push="({path, value, ack}) => $emit('push', {path: ['resources', ...path], value, ack})"
          @pull="({path, ack}) => $emit('pull', {path: ['resources', ...path], ack})"
        />
      </form-section>
      <form-section
        v-if="model.level && model.castWithoutSpellSlots"
        name="Limit Uses"
      >
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <computed-field
              label="Uses"
              hint="How many times this action can be used before needing to be reset"
              class="mr-2"
              :model="model.uses"
              :error-messages="errors.uses"
              @change="({path, value, ack}) =>
                $emit('change', {path: ['uses', ...path], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              label="Uses used"
              type="number"
              hint="How many times this action has already been used: should be 0 in most cases"
              style="flex-basis: 300px;"
              :value="model.usesUsed"
              :error-messages="errors.uses"
              @change="change('usesUsed', ...arguments)"
            />
          </v-col>
        </v-row>
        <smart-select
          label="Reset"
          clearable
          hint="When number of uses used should be reset to zero"
          style="flex-basis: 300px;"
          :items="resetOptions"
          :value="model.reset"
          :error-messages="errors.reset"
          :menu-props="{auto: true, lazy: true}"
          @change="change('reset', ...arguments)"
        />
      </form-section>
      <form-section name="Advanced">
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          hint="Used to let slots find this property in a library, should otherwise be left blank"
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
  import IconColorMenu from '/imports/ui/properties/forms/shared/IconColorMenu.vue';
  import ResourcesForm from '/imports/ui/properties/forms/ResourcesForm.vue';

	export default {
		components: {
      FormSections,
			FormSection,
      IconColorMenu,
      ResourcesForm,
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
      targetOptions: [
        {
          text: 'Self',
          value: 'self',
        }, {
          text: 'Single target',
          value: 'singleTarget',
        }, {
          text: 'Multiple targets',
          value: 'multipleTargets',
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
		};},
	};
</script>

<style lang="css" scoped>
	.v-input--checkbox {
		flex-grow: 0;
		width: 200px;
	}
</style>
