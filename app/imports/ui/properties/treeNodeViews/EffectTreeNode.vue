<template lang="html">
  <div class="layout row align-center justify-start">
    <v-icon
      class="mr-2"
      :class="selected && 'primary--text'"
      :color="model.color"
    >
      {{ effectIcon }}
    </v-icon>
    <div
      class="text-no-wrap text-truncate"
    >
      <template v-if="model.name">
        {{ model.name }}
      </template>
      <template v-else>
        <span class="mr-1">
          {{ displayedValue }}
        </span>
        <span
          v-for="stat in model.stats"
          :key="stat"
          class="mr-1"
        >{{ stat }}</span>
      </template>
    </div>
  </div>
</template>

<script>
// Most of this was copied from EffectViewer and should probably be generalised
import treeNodeViewMixin from '/imports/ui/properties/treeNodeViews/treeNodeViewMixin.js';
import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';

export default {
  mixins: [treeNodeViewMixin],
  computed: {
    resolvedValue(){
      return this.model.result !== undefined ? this.model.result : this.model.calculation;
    },
    effectIcon(){
      let value = this.resolvedValue;
      return getEffectIcon(this.model.operation, value);
    },
    displayedValue(){
      let value = this.resolvedValue;
      switch(this.model.operation) {
        case 'base': return value;
        case 'add': return isFinite(value) ? Math.abs(value) : value;
        case 'mul': return value;
        case 'min': return value;
        case 'max': return value;
        case 'advantage': return;
        case 'disadvantage': return;
        case 'passiveAdd': return isFinite(value) ? Math.abs(value) : value;
        case 'fail': return;
        case 'conditional': return;
        default: return undefined;
      }
    },
  }
}
</script>
