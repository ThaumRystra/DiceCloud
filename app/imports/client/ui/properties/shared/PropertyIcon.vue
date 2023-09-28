<template lang="html">
  <svg-icon
    v-if="model.icon"
    :shape="model.icon.shape"
    :color="color"
    :class="{disabled}"
  />
  <v-icon
    v-else
    :color="color"
    :class="{disabled}"
  >
    {{ icon }}
  </v-icon>
</template>

<script lang="js">
import { getPropertyIcon } from '/imports/constants/PROPERTIES';

export default {
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
    color: {
      type: String,
      default: undefined,
    },
    disabled: Boolean,
  },
  computed: {
    icon() {
      return getPropertyIcon(this.model && this.model.type);
    },
  },
}
</script>

<style lang="css" scoped>
.svg-icon.disabled,
.v-icon.disabled {
  opacity: 0.2;
}
</style>
