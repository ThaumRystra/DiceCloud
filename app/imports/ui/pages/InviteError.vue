<template lang="html">
  <div>
    <v-layout
      column
      align-center
      justify-center
    >
      <h2 style="margin: 48px 28px 16px">
        Invite Error
      </h2>
      <h3>
        {{ error.reason || error.message || error }}
      </h3>
    </v-layout>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: [Object, String],
      default: '',
    }
  }
}
</script>

<style lang="css" scoped>
</style>
