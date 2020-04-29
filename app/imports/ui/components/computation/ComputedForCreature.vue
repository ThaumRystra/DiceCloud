<template lang="html">
  <computed
    :value="value"
    :scope="scope"
    v-bind="$attrs"
  />
</template>

<script>
import Computed from '/imports/ui/components/computation/Computed.vue';

export default {
  inject: {
    computationContext: { default: {} }
  },
  components: {
    Computed,
  },
  props: {
    value: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    scope(){
      return this.computationContext.creature &&
      this.computationContext.creature.variables;
    }
  }
}
</script>
