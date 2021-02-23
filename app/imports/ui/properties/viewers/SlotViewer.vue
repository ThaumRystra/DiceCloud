<template lang="html">
  <div class="buff-viewer">
    <property-name :value="model.name" />
    <property-field
      name="Type"
      :value="model.slotType"
    />
    <property-field
      name="Quantity"
      :value="'quantityExpectedResult' in model ? model.quantityExpectedResult : model.quantityExpected"
    />
    <property-field
      name="Condition"
      :value="'slotConditionResult' in model ? model.slotConditionResult : model.slotCondition"
    />
    <template v-if="model.tags.length">
      <div class="caption">
        Tags
      </div>
      <property-tags :tags="model.tags" />
    </template>
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
      :inactive="model.inactive"
    />
  </div>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'

	export default {
		mixins: [propertyViewerMixin],
	}
</script>
