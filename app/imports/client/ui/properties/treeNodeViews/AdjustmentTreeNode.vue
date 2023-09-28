<template lang="html">
  <div class="layout align-center justify-start">
    <property-icon
      v-if="!hideIcon"
      class="mr-2"
      :model="model"
      :class="selected && 'primary--text'"
      :color="model.color"
    />
    <div
      class="text-no-wrap text-truncate"
    >
      <template v-if="model.amount && model.amount.calculation">
        <span v-if="amount < 0">+</span>
        {{ absoluteAmount }} {{ model.stat }}
        <span v-if="typeof absoluteAmount === 'string' || amount >= 0">
          damage
        </span>
        <span v-if="model.target === 'self'">
          to self
        </span>
      </template>
      <template v-else>
        <span>{{ model.stat || 'Attribute' }} damage</span>
      </template>
    </div>
  </div>
</template>

<script lang="js">
import treeNodeViewMixin from '/imports/client/ui/properties/treeNodeViews/treeNodeViewMixin';

export default {
  mixins: [treeNodeViewMixin],
  computed: {
    amount(){
      return this.model.amount && this.model.amount.value;
    },
    absoluteAmount(){
      if (typeof this.amount === 'number'){
        return Math.abs(this.amount);
      } else {
        return this.amount;
      }
    },
  }
}
</script>
