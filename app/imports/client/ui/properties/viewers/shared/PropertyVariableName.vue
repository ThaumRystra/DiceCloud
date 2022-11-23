<template lang="html">
  <div
    v-if="value"
    class="mb-3"
  >
    <code>{{ value }}</code>
  </div>
</template>

<script lang="js">
export default {
  props: {
    value: {
      type: String,
      default: undefined,
    },
  }
}
</script>

