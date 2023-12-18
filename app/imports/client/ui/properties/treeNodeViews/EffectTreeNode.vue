<template lang="html">
  <div class="layout align-center justify-start">
    <v-icon
      v-if="!hideIcon"
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
      <template v-else-if="model.targetByTags">
        <span class="mr-1">
          {{ displayedValue }}
        </span>
        <span
          class="mr-1"
        >{{ displayedTags }}</span>
      </template>
      <template v-else>
        <span class="mr-1">
          {{ displayedValue }}
        </span>
        <span
          class="mr-1"
        >{{ displayedStats }}</span>
      </template>
    </div>
  </div>
</template>

<script lang="js">
// Most of this was copied from EffectViewer and should probably be generalised
import treeNodeViewMixin from '/imports/client/ui/properties/treeNodeViews/treeNodeViewMixin';
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';

export default {
  mixins: [treeNodeViewMixin],
  computed: {
    resolvedValue(){
      return (this.model.amount && this.model.amount.value) !== undefined ?
        this.model.amount.value : this.model.amount && this.model.amount.calculation;
    },
    effectIcon(){
      let value = this.resolvedValue;
      return getEffectIcon(this.model.operation, value);
    },
    displayedValue(){
      let value = this.resolvedValue;
      switch(this.model.operation) {
        case 'base': return value || 0;
        case 'add': return isFinite(value) ? Math.abs(value) : value || 0;
        case 'mul': return value;
        case 'min': return value;
        case 'max': return value;
        case 'advantage': return;
        case 'disadvantage': return;
        case 'passiveAdd': return isFinite(value) ? Math.abs(value) : value || 0;
        case 'fail': return;
        case 'conditional': return;
        default: return undefined;
      }
    },
    displayedStats(){
      if (!this.model.stats) return 'Selected stats';
      return this.model.stats.join(', ');
    },
    displayedTags(){
      if (!this.model.targetTags) return 'Selected tags';
      const tags = this.model.targetTags.join(', ');
      if (!this.model.extraTags) return tags;
      const extraTags = this.model.extraTags.map(ex => {
        return ` ${ex.operation} ${ex.tags.join(', ')}`
      }).join(' ');
      return tags + extraTags;
    }
  }
}
</script>
