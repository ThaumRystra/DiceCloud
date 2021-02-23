<template lang="html">
  <div class="buff-viewer">
    <property-name :value="model.name" />
    <property-variable-name :value="model.variableName" />
    <property-field
      name="Roll"
      :value="'rollResult' in model ? model.rollResult : model.roll"
    />
    <calculation-error-list :errors="model.rollErrors" />
  </div>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
  import CalculationErrorList from '/imports/ui/properties/forms/shared/CalculationErrorList.vue';

	export default {
    components: {
      CalculationErrorList,
    },
		mixins: [propertyViewerMixin],
	}
</script>
