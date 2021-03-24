<template lang="html">
  <div class="buff-viewer">
    <property-name :value="model.name" />
    <property-field
      name="Save"
      :value="model.stat"
    />
    <property-field
      name="DC"
      :value="'dcResult' in model ? model.dcResult : model.dc"
    />
  </div>
</template>

<script lang="js">
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'

	export default {
		mixins: [propertyViewerMixin],
	}
</script>
