<template lang="html">
  <div>
    <text-field
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
    />
    <div class="layout row wrap justify-start proficiency-form">
      <smart-combobox
        label="Skill"
        class="mr-2"
        multiple
        :value="model.stats"
        :items="skillList"
        :error-messages="errors.stats"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['stats'], value, ack})"
      />
      <proficiency-select
        label="Proficiency"
        style="flex-basis: 300px;"
        :clearable="false"
        :value="model.value"
        @change="(value, ack) => $emit('change', {path: ['value'], value, ack})"
      />
    </div>
  </div>
</template>

<script>
	import ProficiencySelect from '/imports/ui/properties/forms/shared/ProficiencySelect.vue';
  import skillListMixin from '/imports/ui/properties/forms/shared/lists/skillListMixin.js';

	export default {
		components: {
			ProficiencySelect,
		},
    mixins: [skillListMixin],
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
			stats: {
				type: Array,
        default: () => [],
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
