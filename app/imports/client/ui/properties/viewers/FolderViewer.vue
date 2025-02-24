<template lang="html">
  <div class="folder-viewer">
    <v-row
      dense
    >
      <property-field
        :name="$t('TabletopForm.ogp8pUXHP7GwzGUlEkqSF')"
        :value="model.name"
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
