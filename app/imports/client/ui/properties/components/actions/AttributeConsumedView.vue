<template lang="html">
  <div
    class="layout align-center justify-start"
    :class="insufficient && 'error--text'"
  >
    <div
      class="mr-2 text-no-wrap text-truncate"
      style="min-width: 24px; text-align: center;"
    >
      {{ model.quantity && model.quantity.value }}
    </div>
    <div
      v-if="(typeof model.quantity.value !== 'string')"
      class="text-no-wrap text-truncate"
    >
      {{ model.statName || model.variableName }}
    </div>
  </div>
</template>

<script lang="js">
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
