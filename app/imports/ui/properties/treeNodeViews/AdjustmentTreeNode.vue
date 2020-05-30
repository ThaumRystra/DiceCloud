<template lang="html">
  <div class="layout row align-center justify-start">
    <property-icon
      class="mr-2"
      :model="model"
      :class="selected && 'primary--text'"
      :color="model.color"
    />
    <div
      class="text-no-wrap text-truncate"
    >
      <computed
        class="mr-1"
        :value="model.amount"
        :expect-number="false"
      />
      {{ model.stat }} damage
    </div>
  </div>
</template>

<script>
import treeNodeViewMixin from '/imports/ui/properties/treeNodeViews/treeNodeViewMixin.js';
import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';

export default {
  components: {
    Computed: ComputedForCreature,
  },
  mixins: [treeNodeViewMixin],
}
</script>
