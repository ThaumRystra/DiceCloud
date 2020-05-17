<template lang="html">
  <div class="experience-viewer">
    <div
      v-if="model.value"
      class="display-1"
    >
      {{ model.value }} XP
    </div>
    <div class="headline layout row mb-3">
      <property-name :value="model.name" />
      <v-spacer />
      <div>
        {{ model.worldDate }}
      </div>
    </div>
    <p>
      {{ model.date }}
    </p>
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
