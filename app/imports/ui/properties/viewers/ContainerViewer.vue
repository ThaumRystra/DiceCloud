<template lang="html">
  <div class="container-viewer">
		<property-name :value="model.name"/>
		<div v-if="!model.carried" class="caption">
			Not carried
		</div>
		<div v-if="model.contentsWeightless" class="caption">
			Contents are weightless
		</div>
		<property-field name="Weight" :value="`${model.weight} lbs`"/>
		<property-field name="Value" :value="`${model.value} gp`"/>
		<property-description :value="model.description"/>
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
