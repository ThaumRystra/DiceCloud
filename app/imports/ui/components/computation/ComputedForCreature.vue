<template lang="html">
  <computed :value="value" :scope="scope"/>
</template>

<script>
import Computed from '/imports/ui/components/computation/Computed.vue';

export default {
  inject: ['computationContext'],
  components: {
    Computed,
  },
  props: {
    value: {
      type: String,
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
