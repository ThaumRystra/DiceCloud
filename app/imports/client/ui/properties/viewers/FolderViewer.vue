<template lang="html">
  <div class="folder-viewer">
    <v-row
      dense
    >
      <property-field
        name="Name"
        :value="model.name"
      />
      <property-description
        name="Description"
        :model="model.description"
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

<style lang="css" scoped>

</style>
