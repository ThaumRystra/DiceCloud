<template lang="html">
  <v-expansion-panels
    v-model="expand"
    accordion
    tile
    multiple
    hover
  >
    <slot />
  </v-expansion-panels>
</template>

<script lang="js">
export default {
  props: {
    type: {
      type: String,
      default: undefined,
    }
  },
  data() {
    return {
      expand: this.$store.getters.formExpansionByType(this.type),
    };
  },
  watch: {
    expand(value) {
      if (!this.type) return;
      this.$store.commit('setFormExpansion', {type: this.type, value});
    }
  }
}
</script>
