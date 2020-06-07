<template lang="html">
  <action-viewer
    :model="model"
    attack
  />
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
import ActionViewer from '/imports/ui/properties/viewers/ActionViewer.vue';
export default {
  components: {
    ActionViewer,
  },
  mixins: [propertyViewerMixin],
}
</script>

<style lang="css" scoped>
</style>
