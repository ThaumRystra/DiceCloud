<template lang="html">
  <div class="class-level-viewer">
    <v-row
      dense
      justify="center"
    >
      <property-field
        name="Level"
        large
        center
        :value="model.level"
      />
      <property-field
        name="Variable Name"
        mono
        :value="model.variableName"
      />
      <property-field
        v-if="!context.creatureId"
        name="Condition"
        mono
        :value="model.slotFillerCondition"
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
  inject: {
    context: {
      default: {},
    },
  },
}
</script>

<style lang="css" scoped>

</style>
