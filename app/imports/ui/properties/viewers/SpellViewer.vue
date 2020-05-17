<template lang="html">
  <div class="spell-viewer">
    <property-name :value="model.name" />
    <property-field
      name="Casting time"
      :value="model.castingTime"
    />
    <property-field
      name="Range"
      :value="model.range"
    />
    <property-field
      name="Duration"
      :value="model.duration"
    />
    <property-field
      name="Level"
      :value="`${model.level} ${model.school}`"
    />
    <property-description
      v-if="model.description"
      :value="model.description"
    />
  </div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
export default {
	mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>
</style>
