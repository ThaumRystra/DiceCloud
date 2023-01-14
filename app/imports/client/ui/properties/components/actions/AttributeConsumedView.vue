<template lang="html">
  <div
    class="layout align-center justify-start"
    :class="insufficient && 'error--text'"
  >
    <div
      v-if="model.quantity && model.quantity.value !== 1"
      class="mr-2"
      style="width: 24px; text-align: center;"
    >
      {{ model.quantity.value }}
    </div>
    <div
      class="text-no-wrap text-truncate"
    >
      {{ model.statName || model.variableName }}
    </div>
    <div
      v-if="(typeof model.available) == 'number'"
      class="text--disabled text-no-wrap text-truncate ml-1 flex-shrink-0"
    >
      ({{ model.available }})
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
