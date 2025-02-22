<template lang="html">
  <div class="buff-form">
    <smart-select
      :label="$t('BranchForm.FmQ75e44kBMrrHjwYzmQ1')"
      :items="typeOptions"
      :hint="typeHint"
      :value="model.branchType"
      :error-messages="errors.branchType"
      :menu-props="{auto: true, lazy: true}"
      @change="change('branchType', ...arguments)"
    />
    <v-expand-transition>
      <computed-field
        v-if="model.branchType === 'if'"
        :label="$t('PropertyForm.reKPKGEnAfdHpBLoywE1w')"
        :hint="$t('BranchForm.w2jF6BdJcNceAcOoj-0Rh')"
        :model="model.condition"
        :error-messages="errors.condition"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['condition', ...path], value, ack})"
      />
      <computed-field
        v-else-if="model.branchType === 'index'"
        :label="$t('BranchForm.qq_xhg0usIJNPJVpiKNNl')"
        :hint="$t('BranchForm.0rJv1n_f8jRiwrqPracCR')"
        :model="model.condition"
        :error-messages="errors.condition"
        @change="({path, value, ack}) =>
          $emit('change', {path: ['condition', ...path], value, ack})"
      />
    </v-expand-transition>
    <form-sections type="branch">
      <form-section :name="$t('ActionForm.7JkrChA5Oz7n_-wF0QxsW')">
        <smart-switch
          :label="$t('ActionForm.pTOkAuMdrx_hGI0E1xQl2')"
          :value="model.silent"
          :error-messages="errors.silent"
          @change="change('silent', ...arguments)"
        />
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
  props: {
    parentTarget: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      typeOptions: [
        { value: 'if', text: this.$t('BranchForm.SomVaD-_G-stlmtSEeJ4w') },
        { value: 'hit', text: this.$t('BranchForm.0inXyGC_3HQLzxgO6z2f0') },
        { value: 'miss', text: this.$t('BranchForm.vftr_XM4oZjPUjH96B5qm') },
        { value: 'failedSave', text: this.$t('BranchForm.Gi7ZFuJP58OUhkUBYnH-u') },
        { value: 'successfulSave', text: this.$t('BranchForm.cmCVz0se_9sHKBdxbp-9u') },
        { value: 'eachTarget', text: this.$t('BranchForm.FhXVP8QcggmDUKoQJb9sD') },
        { value: 'random', text: this.$t('BranchForm.fxRhrS9aOD7kX4DLOegmY') },
        { value: 'index', text: this.$t('BranchForm.OFZphIXo_lqnX-vnPoQRc') },
        { value: 'choice', text: this.$t('BranchForm.XPK-8Ci9jaFYL0KeeseO1') },
      ],
    }
  },
  computed: {
    typeHint() {
      switch (this.model.branchType) {
        case 'if': return this.$t('BranchForm.BJXXvVRlZ5Er1_CD_SeuE');
        case 'hit': return this.$t('BranchForm.WyO5vhpvwBG4LmfAc60fz');
        case 'miss': return this.$t('BranchForm.ZdtJxBggyw6XLDGuEtInK');
        case 'failedSave': return this.$t('BranchForm.H0dAio0Zhb5B2-ccOMomc');
        case 'successfulSave': return this.$t('BranchForm.IUf6-15AhyS4iQ3NBqVrm');
        case 'eachTarget': return this.$t('BranchForm.BkbdX3vJYOmRw4iwCl38h');
        case 'random': return this.$t('BranchForm.G_RfuTT8RD-P3Bk05R6f9');
        case 'index': return this.$t('BranchForm.6AzVEkMDrx-6-awEDatgG');
        case 'choice': return this.$t('BranchForm.BiuNuKC-fpzPzYrjhNyFb');
        default: return '';
      }
    }
  }
}
</script>

<style lang="css" scoped>

</style>
