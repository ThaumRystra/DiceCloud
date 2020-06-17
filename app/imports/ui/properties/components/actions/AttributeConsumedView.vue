<template lang="html">
  <div
    class="layout row align-center justify-start"
    :class="insufficient && 'error--text'"
  >
    <div
      class="mr-2"
      style="width: 24px; text-align: center;"
    >
      {{ model.quantity }}
    </div>
    <div
      class="text-no-wrap text-truncate"
    >
      {{ model.statName || model.variableName }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    insufficient(){
      return this.model.quantity > this.model.available;
    },
  },
}
</script>
