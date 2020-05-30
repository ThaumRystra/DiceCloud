<template lang="html">
  <div class="layout row align-center justify-start">
    <property-icon
      class="mr-2"
      :model="model"
      :color="model.color"
      :class="selected && 'primary--text'"
    />
    <div class="text-no-wrap text-truncate">
      {{ title }}
    </div>
  </div>
</template>

<script>
import treeNodeViewMixin from '/imports/ui/properties/treeNodeViews/treeNodeViewMixin.js';

export default {
  mixins: [treeNodeViewMixin],
}
</script>
