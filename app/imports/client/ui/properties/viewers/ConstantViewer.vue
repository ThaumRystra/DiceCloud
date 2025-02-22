<template lang="html">
  <div class="buff-viewer">
    <v-row dense>
      <property-field
        mono
        :name="$t('AttributeForm.vWQj52YzUPPcXSMEZ6dvh')"
        :value="model.variableName"
      />
      <property-field
        :name="$t('ConstantViewer.FZU6EecvlbgCMNn9Zp0bK')"
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
