<template lang="html">
  <div class="layout align-center justify-start">
    <proficiency-icon
      v-if="!hideIcon"
      class="mr-2"
      :class="selected && 'primary--text'"
      :color="model.color"
      :value="model.value"
    />
    <div class="text-no-wrap text-truncate">
      <template v-if="!model.name && model.stats && model.stats.length">
        {{ model.stats.join(', ') }}
      </template>
      <template v-else>
        {{ title }}
      </template>
    </div>
  </div>
</template>

<script lang="js">
// Most of this was copied from EffectViewer and should probably be generalised
import treeNodeViewMixin from '/imports/client/ui/properties/treeNodeViews/treeNodeViewMixin';
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';

export default {
  components: {
    ProficiencyIcon,
  },
  mixins: [treeNodeViewMixin]
}
</script>
