<template lang="html">
  <div class="layout align-center justify-start">
    <property-icon
      v-if="!hideIcon"
      class="mr-2"
      :model="model"
      :color="model.color"
      :class="selected && 'primary--text'"
    />
    <div class="text-no-wrap text-truncate">
      <template v-if="model.dc && Number.isFinite(model.dc.value)">
        DC {{ model.dc.value }}
      </template>
      {{ title }}
    </div>
  </div>
</template>

<script lang="js">
import treeNodeViewMixin from '/imports/client/ui/properties/treeNodeViews/treeNodeViewMixin';
import PROPERTIES from '/imports/constants/PROPERTIES';

export default {
mixins: [treeNodeViewMixin],
computed: {
  title() {
    let model = this.model;
    if (!model) return;
    if (model.name) return model.name;
    if (model.stat) return model.stat;
    let prop = PROPERTIES[model.type]
    return prop && prop.name;
    }
  }
}
</script>
