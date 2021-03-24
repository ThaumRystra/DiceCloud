<template lang="html">
  <svg-icon
    v-if="model.icon"
    :shape="model.icon.shape"
    :color="color"
  />
  <v-icon
    v-else
    :color="color"
  >
    {{ icon }}
  </v-icon>
</template>

<script lang="js">
import { getPropertyIcon } from '/imports/constants/PROPERTIES.js';

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
	},
	computed: {
		icon(){
			return getPropertyIcon(this.model && this.model.type);
		},
	},
}
</script>
