<template lang="html">
  <div class="layout row align-center justify-start">
    <v-icon
      class="mr-2"
      :color="model.color"
      :class="selected && 'primary--text'"
    >
      {{ icon }}
    </v-icon>
    <div
      class="text-no-wrap text-truncate"
    >
      <computed
        class="mr-1"
        :value="model.amount"
        :expect-number="false"
      />
      <span class="mr-1">
        {{ model.damageType }}
      </span>
      <span v-if="model.damageType !== 'healing'">
        damage
      </span>
    </div>
  </div>
</template>

<script>
import treeNodeViewMixin from '/imports/ui/properties/treeNodeViews/treeNodeViewMixin.js';
import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';
import { getPropertyIcon } from '/imports/constants/PROPERTIES.js';

export default {
  components: {
    Computed: ComputedForCreature,
  },
  mixins: [treeNodeViewMixin],
  computed: {
		icon(){
      if (this.model.damageType === 'healing'){
        return 'group_work'
      } else {
        return getPropertyIcon('damage');
      }
		},
	},
}
</script>
