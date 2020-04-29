<template lang="html">
  <computed
    :value="value"
    :scope="scope"
    v-bind="$attrs"
  />
</template>

<script>
import Computed from '/imports/ui/components/computation/Computed.vue';
import Creatures from '/imports/api/creature/Creatures.js';

export default {
  inject: ['computationContext'],
  components: {
    Computed,
  },
  props: {
    value: {
      type: String,
      default: undefined,
    },
  },
  meteor: {
    creature(){
      return Creatures.findOne(this.creatureId);
    },
  },
  computed: {
    scope(){
      return this.computationContext.creature && this.computationContext.creature.variables;
    }
  }
}
</script>
