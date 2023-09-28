<template lang="html">
  <div class="layout align-center justify-start">
    <property-icon
      v-if="!hideIcon"
      class="mr-2"
      :model="model"
      :color="model.color"
      :class="selected && 'primary--text'"
    />
    <tree-node-view
      v-if="model.cache && model.cache.node && model.cache.node.type !== 'reference'"
      :model="model.cache.node"
    />
    <div
      v-else
      class="text-no-wrap text-truncate"
    >
      {{ model.cache.node && model.cache.node.name || title }}
    </div>
  </div>
</template>

<script lang="js">
import treeNodeViewMixin from '/imports/client/ui/properties/treeNodeViews/treeNodeViewMixin';

export default {
  name: 'ReferenceTreeNode',
  mixins: [treeNodeViewMixin],
  beforeCreate () {
    this.$options.components.TreeNodeView = require('/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue').default
  },
}
</script>
