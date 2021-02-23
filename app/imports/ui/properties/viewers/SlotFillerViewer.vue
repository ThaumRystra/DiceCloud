<template lang="html">
  <div class="slot-filler-viewer">
    <property-name :value="model.name" />
    <v-img
      v-if="model.picture"
      :src="model.picture"
      :height="200"
      contain
      class="slot-card-image"
    />
    <property-field
      name="Type"
      :value="model.slotFillerType"
    />
    <property-field
      name="Quantity"
      :value="model.slotQuantityFilled"
    />
    <property-field
      name="Condition"
      :value="model.slotFillerCondition"
    />
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
      :inactive="model.inactive"
    />
  </div>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';

	export default {
		mixins: [propertyViewerMixin],
	}
</script>
