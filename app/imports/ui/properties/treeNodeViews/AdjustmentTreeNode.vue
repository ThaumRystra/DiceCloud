<template lang="html">
  <div class="layout row align-center justify-start">
    <property-icon
      v-if="!hideIcon"
      class="mr-2"
      :model="model"
      :class="selected && 'primary--text'"
      :color="model.color"
    />
    <div
      class="text-no-wrap text-truncate"
    >
      {{ model.amountResult }} {{ model.stat }} damage
    </div>
  </div>
</template>

<script>
import treeNodeViewMixin from '/imports/ui/properties/treeNodeViews/treeNodeViewMixin.js';

export default {
  mixins: [treeNodeViewMixin],
}
</script>
