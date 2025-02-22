<template lang="html">
  <div class="class-level-viewer">
    <v-row
      dense
      justify="center"
    >
      <property-field
        :name="$t('CharacterCreationDialog.ALoCn8fXt0dv34QiFx1jx')"
        large
        center
        :value="model.level"
      />
      <property-field
        :name="$t('AttributeViewer.MNk7FUYtABwXmOJJeujzZ')"
        mono
        :value="model.variableName"
      />
      <property-field
        v-if="!context.creatureId"
        :name="$t('PropertyForm.reKPKGEnAfdHpBLoywE1w')"
        mono
        :value="model.slotFillerCondition"
      />
      <property-description
        :name="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
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
