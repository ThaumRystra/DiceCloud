<template lang="html">
  <div>
    <div class="layout align-center justify-start" style="height:40px;">
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
    <div
      v-if="showExternalDetails"
      v-for="effect in model.amount.effects">
      <div v-if="effect.amount.value !== 0"
        style="position:relative; top:-15px; left:5px; height:25px;">
        <inline-effect
          hide-breadcrumbs
          :key="effect._id"
          :data-id="effect._id"
          :model="effect"
        />
      </div>
    </div>
  </div>
</template>

<script lang="js">
import treeNodeViewMixin from '/imports/client/ui/properties/treeNodeViews/treeNodeViewMixin.js';
import { getPropertyIcon } from '/imports/constants/PROPERTIES.js';
import InlineEffect from '../components/effects/InlineEffect.vue';

export default {
  mixins: [treeNodeViewMixin],
  components: {InlineEffect},
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
