<template lang="html">
  <div class="attack-viewer">
    <property-field name="Attack roll bonus">
      <computed
        signed
        :value="model.rollBonus"
      />
    </property-field>
    <action-viewer :model="model" />
  </div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';
import ActionViewer from '/imports/ui/properties/viewers/ActionViewer.vue';

export default {
  components: {
    ActionViewer,
    Computed: ComputedForCreature,
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
