<template lang="html">
  <div class="spell-list-viewer">
    <property-name :value="model.name" />
    <property-variable-name :value="model.variableName" />
    <property-field
      name="Maximum prepared spells"
      :value="model.maxPreparedResult"
    />
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
    />
  </div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
export default {
	mixins: [propertyViewerMixin],
}
</script>
