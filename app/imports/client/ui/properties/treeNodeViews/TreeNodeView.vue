<template lang="html">
  <component
    :is="treeNodeView"
    :model="model"
    :selected="selected"
    :show-external-details="showExternalDetails"
    :class="{
      'inactive': model.inactive,
    }"
    v-bind="$attrs"
  />
</template>

<script lang="js">
import treeNodeViewIndex from '/imports/client/ui/properties/treeNodeViews/treeNodeViewIndex';

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
    showExternalDetails: Boolean,
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
  .inactive {
    opacity: 0.6;
  }
</style>
