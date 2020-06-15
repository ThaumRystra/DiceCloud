<template lang="html">
  <component
    :is="treeNodeView"
    :model="model"
    :selected="selected"
  />
</template>

<script>
import treeNodeViewIndex from '/imports/ui/properties/treeNodeViews/treeNodeViewIndex.js';

export default {
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
