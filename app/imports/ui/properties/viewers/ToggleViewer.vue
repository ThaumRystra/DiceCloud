<template lang="html">
  <div class="toggle-viewer">
    <property-name :value="model.name" />
    <property-field
      v-if="model.disabled || model.enabled"
      name="Status"
      :value="model.enabled ? 'Enabled' : 'Disabled'"
    />
    <template
      v-else-if="model.condition"
    >
      <property-field
        name="Condition"
        :value="model.condition"
      />
      <property-field
        v-if="'toggleResult' in model"
        name="Result"
        :value="model.toggleResult"
      />
    </template>
  </div>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'

	export default {
		mixins: [propertyViewerMixin],
	}
</script>
