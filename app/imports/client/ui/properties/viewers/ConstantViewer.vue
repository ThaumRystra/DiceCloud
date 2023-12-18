<template lang="html">
  <div class="buff-viewer">
    <v-row dense>
      <property-field
        mono
        name="Variable name"
        :value="model.variableName"
      />
      <property-field
        name="Calculation"
        :value="model.calculation"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'

export default {
  mixins: [propertyViewerMixin],
}
</script>
