<script setup lang="ts">
defineProps<{
  error: object | string;
}>();
</script>

<template lang="html">
  <div>
    <div
      class="d-flex flex-column align-center justify-center"
    >
      <h2 style="margin: 48px 28px 16px">
        Invite Error
      </h2>
      <h3>
        {{ error.reason || error.message || error }}
      </h3>
    </div>
  </div>
</template>

<style lang="css" scoped>
</style>
