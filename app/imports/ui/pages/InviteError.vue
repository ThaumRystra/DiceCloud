<template lang="html">
  <div>
    Invite Error!
    <p>
      {{ error.reason || error.message || error }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: [Object, String],
      required: true,
    }
  }
}
</script>

<style lang="css" scoped>
</style>
