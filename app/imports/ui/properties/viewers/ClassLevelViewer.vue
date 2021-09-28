<template lang="html">
  <div class="class-level-viewer">
    <div>
      <span class="name text-h5">
        {{ model.name }} {{ model.level }}
      </span>
    </div>
    <p class="my-2">
      <code>{{ model.variableName }}</code>
    </p>
    <property-description
      :model="model.description"
    />
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'

export default {
	mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>
</style>
