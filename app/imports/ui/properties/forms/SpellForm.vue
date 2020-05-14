<template lang="html">
  <div class="attribute-form">
    <text-field
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
    />
    <div class="layout row wrap">
      <smart-select
        label="Level"
        class="mx-1"
        style="flex-basis: 300px;"
        :items="spellLevels"
        :value="model.level"
        :error-messages="errors.level"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['level'], value, ack})"
      />
      <smart-select
        label="School"
        class="mx-1"
        style="flex-basis: 300px;"
        :items="magicSchools"
        :value="model.school"
        :error-messages="errors.school"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['school'], value, ack})"
      />
    </div>
    <div class="layout row wrap">
      <v-switch
        label="Always prepared"
        style="width: 200px; flex-grow: 0;"
        class="ml-2"
        :input-value="model.alwaysPrepared"
        :error-messages="errors.alwaysPrepared"
        @change="e => $emit('change', {path: ['alwaysPrepared'], value: !!e})"
      />
    </div>
    <text-field
      label="Casting Time"
      :value="model.castingTime"
      :error-messages="errors.castingTime"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['castingTime'], value, ack})"
    />
    <text-field
      label="Range"
      :value="model.range"
      :error-messages="errors.range"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['range'], value, ack})"
    />
    <div class="layout row wrap justify-space-between">
      <v-checkbox
        label="Verbal"
        :input-value="model.verbal"
        :error-messages="errors.verbal"
        @change="(value) => $emit('change', {path: ['verbal'], value})"
      />
      <v-checkbox
        label="Somatic"
        :input-value="model.somatic"
        :error-messages="errors.somatic"
        @change="(value) => $emit('change', {path: ['somatic'], value})"
      />
      <v-checkbox
        label="Concentration"
        :input-value="model.concentration"
        :error-messages="errors.concentration"
        @change="(value) => $emit('change', {path: ['concentration'], value})"
      />
      <v-checkbox
        label="Ritual"
        :input-value="model.ritual"
        :error-messages="errors.ritual"
        @change="(value) => $emit('change', {path: ['ritual'], value})"
      />
    </div>
    <text-field
      label="Material"
      :value="model.material"
      :error-messages="errors.material"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['material'], value, ack})"
    />
    <text-field
      label="Duration"
      :value="model.duration"
      :error-messages="errors.duration"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['duration'], value, ack})"
    />
    <text-area
      label="Description"
      :value="model.description"
      :error-messages="errors.description"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['description'], value, ack})"
    />
    <form-sections>
      <form-section
        name="Advanced"
      >
        <v-combobox
          label="Spell lists"
          multiple
          chips
          deletable-chips
          box
          :value="model.spellLists"
          :error-messages="errors.spellLists"
          @change="(value) => $emit('change', {path: ['spellLists'], value})"
        />
      </form-section>
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

	export default {
		components: {
      FormSections,
			FormSection,
      ActionForm,
		},
		props: {
			model: {
				type: Object,
				default: () => ({}),
			},
			errors: {
				type: Object,
				default: () => ({}),
			},
      debounceTime: {
        type: Number,
        default: undefined,
      },
		},
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
