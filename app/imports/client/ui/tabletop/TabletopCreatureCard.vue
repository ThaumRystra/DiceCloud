<template lang="html">
  <v-card
    style="height: 150px; min-width: 120px;"
  >
    <v-img
      :src="model.picture"
      aspect-ratio="1"
      position="top center"
    />
    <div
      class="small-title"
    >
      {{ model.name }}
    </div>
  </v-card>
</template>

<script lang="js">
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
.small-title {
  font-size: 14px;
  padding: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
