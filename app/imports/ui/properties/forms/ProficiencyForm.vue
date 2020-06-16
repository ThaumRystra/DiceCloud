<template lang="html">
  <div>
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <div class="layout row wrap justify-start proficiency-form">
      <smart-combobox
        label="Skills"
        class="mr-2"
        multiple
        chips
        deletable-chips
        :value="model.stats"
        :items="skillList"
        :error-messages="errors.stats"
        @change="change('stats', ...arguments)"
      />
      <proficiency-select
        label="Proficiency"
        style="flex-basis: 300px;"
        :clearable="false"
        :value="model.value"
        @change="change('value', ...arguments)"
      />
    </div>
  </div>
</template>

<script>
	import ProficiencySelect from '/imports/ui/properties/forms/shared/ProficiencySelect.vue';
  import skillListMixin from '/imports/ui/properties/forms/shared/lists/skillListMixin.js';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

	export default {
		components: {
			ProficiencySelect,
		},
    mixins: [propertyFormMixin, skillListMixin],
	};
</script>

<style lang="css" scoped>
</style>
