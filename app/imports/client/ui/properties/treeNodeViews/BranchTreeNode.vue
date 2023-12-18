<template lang="html">
  <div class="layout align-center justify-start">
    <property-icon
      v-if="!hideIcon"
      class="mr-2"
      :model="model"
      :color="model.color"
      :class="selected && 'primary--text'"
    />
    <div class="text-no-wrap text-truncate">
      {{ name }}
    </div>
  </div>
</template>

<script lang="js">
import treeNodeViewMixin from '/imports/client/ui/properties/treeNodeViews/treeNodeViewMixin';

export default {
  mixins: [treeNodeViewMixin],
  computed: {
    name(){
      switch(this.model.branchType){
        case 'if': return 'On condition';
        case 'hit': return 'On hit';
        case 'miss': return 'On miss';
        case 'failedSave': return 'On failed save';
        case 'successfulSave': return 'On save';
        case 'eachTarget': return 'Each target';
        case 'random': return 'Pick one at random';
        case 'index': return 'Pick one by index';
        case 'choice': return 'User choice';
        default: return '';
      }
    }
  }
}
</script>
