<template>
  <div class="name text-h5 mb-2">
    {{ value }}
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: undefined,
    },
  }
}
</script>
