<template lang="html">
  <div class="folder-viewer">
    <v-row
      dense
      align="stretch"
      justify="center"
      justify-sm="start"
    >
      <property-field
        name="Name"
        :value="model.name"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin.js'
export default {
  mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>

</style>
