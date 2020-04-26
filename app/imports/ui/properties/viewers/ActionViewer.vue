<template lang="html">
  <div class="action-viewer">
    <property-field
      name="Action type"
      :value="model.actionType"
    />
    <property-field
      name="Target"
      :value="model.target"
    />
    <property-field
      v-if="model.tags.length"
      name="tags"
      :value="model.tags.join(', ')"
    />
    <property-field
      name="Uses"
      :value="model.uses"
    />
    <property-field
      name="Uses used"
      :value="model.usesUsed"
    />
    <property-field
      name="Reset"
      :value="reset"
    />
    <property-description :value="model.description" />
    <results-viewer :model="model.results" />
  </div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
import ResultsViewer from '/imports/ui/properties/viewers/ResultsViewer.vue';

export default {
  components: {
    ResultsViewer
  },
  mixins: [propertyViewerMixin],
  computed: {
    reset(){
      let reset = this.model.reset
      if (reset === 'shortRest'){
        return 'Reset on a short rest';
      } else if (reset === 'longRest'){
        return 'Reset on a long rest';
      }
      return undefined;
    }
  },
}
</script>

<style lang="css" scoped>
</style>
