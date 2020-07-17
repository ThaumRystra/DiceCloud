<template lang="html">
  <v-card>
    <v-img
      :src="model.picture"
      aspect-ratio="1"
      position="top center"
    />
    <v-card-title>{{ model.name }}</v-card-title>
  </v-card>
</template>

<script>
export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="css" scoped>
</style>
