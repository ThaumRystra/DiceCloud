<template lang="html">
  <div class="layout align-center justify-start">
    <v-icon
      v-if="!hideIcon"
      class="mr-2"
      :color="model.color"
      :class="selected && 'primary--text'"
    >
      {{ icon }}
    </v-icon>
    <div class="text-no-wrap text-truncate">
      {{ model.amount && model.amount.value }}
      {{ model.damageType }}<span v-if="model.damageType !== 'healing'">&nbsp;damage</span>
      <span v-if="model.target === 'self'">to self</span>
    </div>
  </div>
</template>

<script lang="js">
import treeNodeViewMixin from '/imports/client/ui/properties/treeNodeViews/treeNodeViewMixin.js';
import { getPropertyIcon } from '/imports/constants/PROPERTIES.js';

export default {
  mixins: [treeNodeViewMixin],
  computed: {
    icon() {
      if (this.model.damageType === 'healing') {
        return 'mdi-hospital-box-outline'
      } else {
        return getPropertyIcon('damage');
      }
    },
  },
}
</script>
