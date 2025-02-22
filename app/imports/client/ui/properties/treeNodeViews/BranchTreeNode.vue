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
        case 'if': return this.$t('BranchTreeNode.sW4DuQTvkmSs8CszW8u0V');
        case 'hit': return this.$t('BranchTreeNode.49ehFme1kwg1Gv7qOjbrP');
        case 'miss': return this.$t('BranchTreeNode.5W3yB5wJV3feGAT6uF2By');
        case 'failedSave': return this.$t('BranchTreeNode.xEwOD6Z0d9lsuEv2s4LWq');
        case 'successfulSave': return this.$t('BranchTreeNode.V2cQA7PkQhQPGd_MDXoKQ');
        case 'eachTarget': return this.$t('BranchTreeNode.Z7bMb_qdi4xS896SO-JrJ');
        case 'random': return this.$t('BranchTreeNode.gev48hiSRP6hXvlH2OsTo');
        case 'index': return this.$t('BranchTreeNode.r1Nwfl4CB4r7UBX6pNsBN');
        case 'choice': return this.$t('BranchForm.XPK-8Ci9jaFYL0KeeseO1');
        default: return '';
      }
    }
  }
}
</script>
