<template lang="html">
  <div class="note-viewer">
    <v-row dense>
      <property-description
        :name="$t('ActionForm.uMqJz6So1tbWiONiw7coZ')"
        :model="model.summary"
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
}
</script>

<style lang="css" scoped>

</style>
