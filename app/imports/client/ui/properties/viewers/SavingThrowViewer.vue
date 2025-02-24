<template lang="html">
  <div class="saving-throw-viewer">
    <v-row dense>
      <property-field
        :name=$t('DamageForm.K4tBJdCA-IX5x2x7_gFU_')
        large
        center
        :calculation="model.dc"
      />
      <property-field
        :name="$t('ImageInputDialog.dcbgmuOVYglN2J7VpTBFU')"
        mono
        :value="model.stat"
      />
      <property-field
        v-if="model.target === 'self'"
        :name="$t('DamageForm.zHu2ur9PIJmRoyqAo7Wmm')"
        :value=$t('ActionForm.wvr48hnF1DbxApmRDC3R0')
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
