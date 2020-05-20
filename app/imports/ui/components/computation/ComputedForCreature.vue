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
    context: { default: {} }
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
      return this.context.creature &&
      this.context.creature.variables;
    }
  }
}
</script>
