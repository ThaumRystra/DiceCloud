<template lang="html">
  <div class="roll-viewer">
    <v-row dense>
      <property-field
        :name="$t('AttributeViewer.MNk7FUYtABwXmOJJeujzZ')"
        mono
        :value="model.variableName"
      />
      <property-field
        :name="$t('SelectedCreatureBar.NgRLZ1KujlD3o3EtzLY3R')"
        large
        center
        :calculation="model.roll"
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
