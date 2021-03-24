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
      :value="model.slotCondition"
    />
    <property-field
      v-if="'slotConditionResult' in model"
      name="Condition result"
      :value="model.slotConditionResult"
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

<script lang="js">
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'

	export default {
		mixins: [propertyViewerMixin],
	}
</script>
