<template lang="html">
  <div class="item-viewer">
    <property-name :value="model.name" />
    <property-field
      name="Plural name"
      :value="model.plural"
    />
    <property-field
      name="Quantity"
      :value="model.quantity"
    />
    <property-field
      name="Weight"
      :value="`${model.weight} lbs`"
    />
    <property-field
      name="Value"
      :value="`${model.value} gp`"
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
