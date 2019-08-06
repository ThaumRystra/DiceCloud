<template lang="html">
  <div class="skill-viewer">
  	<property-name :value="model.name"/>
		<property-variable-name :value="model.variableName"/>
		<property-field name="Ability" :value="model.ability"/>
		<property-field name="Type" :value="model.skillType"/>
		<property-field name="Base value" :value="model.baseValue"/>
		<property-field name="Base proficiency" :value="model.baseProficiency"/>
		<property-description :value="model.description"/>
  </div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
export default {
	mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>
</style>
