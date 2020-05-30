<template lang="html">
  <div class="layout row align-center justify-start">
    <property-icon
      class="mr-2"
      :model="model"
      :color="model.color"
      :class="selected && 'primary--text'"
    />
    <v-icon
      v-if="model.equipped"
      class="mr-2"
      :class="selected && 'primary--text'"
      small
    >
      pan_tool
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
import PROPERTIES from '/imports/constants/PROPERTIES.js';

export default {
  mixins: [treeNodeViewMixin],
  computed: {
    title(){
      let model = this.model;
      if (!model) return;
      if (model.quantity !== 1){
        if (model.plural){
          return `${model.quantity} ${model.plural}`;
        } else if (model.name){
          return `${model.quantity} ${model.name}`;
        }
      } else if (model.name) {
        return model.name;
      }
      let prop = PROPERTIES[model.type]
      return prop && prop.name;
    }
  }
}
</script>

<style lang="css" scoped>
</style>
