<template lang="html">
  <div class="attack-viewer">
    <property-field name="Action type" :value="model.actionType"/>
    <property-field name="Target" :value="model.target"/>
    <property-field name="tags" :value="model.tags.join(', ')" v-if="model.tags.length"/>
    <property-field name="Uses" :value="model.uses"/>
    <property-field name="Uses used" :value="model.usesUsed"/>
    <property-field name="Reset" :value="reset"/>
    <property-field name="Attack roll bonus">
      <computed signed :value="model.rollBonus"/>
    </property-field>
    <property-description :value="model.description"/>
	</div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';

export default {
  mixins: [propertyViewerMixin],
  components: {
    Computed: ComputedForCreature,
  },
  computed: {
    reset(){
      let reset = this.model.reset
      if (reset === 'shortRest'){
        return `Reset on a short rest`;
      } else if (reset === 'longRest'){
        return `Reset on a long rest`;
      }
    }
  },
}
</script>

<style lang="css" scoped>
</style>
