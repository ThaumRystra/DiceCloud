<template lang="html">
  <div class="layout align-center justify-start">
    <property-icon
      v-if="!hideIcon"
      class="mr-2"
      :model="model"
      :color="model.color"
      :class="selected && 'primary--text'"
    />
    <v-icon
      v-if="model.equipped && !hideIcon"
      class="mr-2"
      :class="selected && 'primary--text'"
      small
    >
      mdi-account-arrow-left
    </v-icon>
    <div
      class="text-no-wrap text-truncate"
      :class="model.equipped && 'body-2'"
    >
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
    title(){
      let model = this.model;
      if (!model) return;
      if (Number.isFinite(model.quantity) && model.quantity !== 1){
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
