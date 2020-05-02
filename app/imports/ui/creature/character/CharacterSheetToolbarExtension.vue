<template lang="html">
  <v-tabs
    slot="extension"
    :value="value"
    centered
    grow
    max="100px"
    @change="e => $emit('input', e)"
  >
    <v-tab>
      Stats
    </v-tab>
    <v-tab>
      Features
    </v-tab>
    <v-tab>
      Inventory
    </v-tab>
    <v-tab>
      Spells
    </v-tab>
    <v-tab>
      Persona
    </v-tab>
    <v-tab>
      Tree
    </v-tab>
  </v-tabs>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      required: true,
    },
  }
}
</script>

<style lang="css" scoped>
  .v-tabs__container--grow .v-tabs__div {
    max-width: 120px !important;
  }
</style>
