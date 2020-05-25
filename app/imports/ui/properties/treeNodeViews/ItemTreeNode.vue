<template lang="html">
  <div class="layout row align-center justify-start">
    <v-icon
      class="mr-2"
      :class="selected && 'primary--text'"
      :color="model.color"
    >
      {{ model.equipped ? 'check_box' : 'check_box_outline_blank' }}
    </v-icon>
    <div
      class="text-no-wrap text-truncate"
      :class="model.equipped && 'body-2'"
    >
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

<style lang="css" scoped>
</style>
