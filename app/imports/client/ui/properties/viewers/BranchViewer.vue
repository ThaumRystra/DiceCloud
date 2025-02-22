<template lang="html">
  <div class="branch-viewer">
    <v-row dense>
      <property-field
        :name="$t('BranchForm.FmQ75e44kBMrrHjwYzmQ1')"
        :value="name"
      />
      <property-field
        v-if="model.branchType === 'if'"
        :name="$t('PropertyForm.reKPKGEnAfdHpBLoywE1w')"
        :calculation="model.condition"
      />
      <property-field
        v-else-if="model.branchType === 'index'"
        :name="$t('BranchForm.qq_xhg0usIJNPJVpiKNNl')"
        :calculation="model.condition"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
import numberToSignedString from '../../../../api/utility/numberToSignedString';

export default {
  mixins: [propertyViewerMixin],
  computed: {
    name() {
      switch (this.model.branchType) {
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
  },
  methods: {
    numberToSignedString,
  }
}
</script>

<style lang="css" scoped>
.ability-value {
  font-weight: 600;
  font-size: 24px !important;
  color: rgba(0, 0, 0, 0.54);
}

.mod,
.ability-value {
  text-align: center;
  width: 100%;
}

.attribute-value {
  text-align: center;
}
</style>
