<template lang="html">
  <component
    :is="treeNodeView"
    :model="model"
    :selected="selected"
    :class="{
      'inactive': model.inactive,
      'by-ancestor': model.deactivatedByAncestor,
      'by-self': model.deactivatedBySelf,
      'by-toggle': model.deactivatedByToggle,
    }"
  />
</template>

<script lang="js">
import treeNodeViewIndex from '/imports/ui/properties/treeNodeViews/treeNodeViewIndex.js';

export default {
  name: 'TreeNodeView',
  components: {
    ...treeNodeViewIndex
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    selected: Boolean,
  },
  computed: {
    treeNodeView(){
      let type = this.model.type;
      return treeNodeViewIndex[type] || treeNodeViewIndex.default;
    },
  }
}
</script>

<style lang="css" scoped>
  .inactive: {
    background: red;
  }
</style>
