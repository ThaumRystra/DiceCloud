<template lang="html">
  <div class="action-viewer">
    <div class="layout row wrap align-center">
      <div>
        {{ model.actionType }}
      </div>
      <div class="flex">
        <property-tags :tags="model.tags" />
      </div>
      <div v-if="model.usesResult">
        {{ model.usesResult - (model.usesUsed) }}/{{ model.usesResult }}
      </div>
    </div>
    <div
      v-if="attack"
      class="layout row justify-center align-center ma-3"
    >
      <div class="headline mr-2">
        {{ rollBonus }}
      </div>
      <em>
        to hit
      </em>
    </div>
    <div
      v-if="reset"
      class="my-2"
    >
      {{ reset }}
    </div>
    <property-description
      v-if="model.description"
      :value="model.description"
    />
  </div>
</template>

<script>
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

export default {
  mixins: [propertyViewerMixin],
  props: {
    attack: Boolean,
  },
  computed: {
    reset(){
      let reset = this.model.reset
      if (reset === 'shortRest'){
        return 'Reset on a short rest';
      } else if (reset === 'longRest'){
        return 'Reset on a long rest';
      }
      return undefined;
    },
    rollBonus(){
      return numberToSignedString(this.model.rollBonusResult);
    },
  },
}
</script>

<style lang="css" scoped>
</style>
