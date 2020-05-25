<template lang="html">
  <v-icon :color="color">
    {{ icon }}
  </v-icon>
</template>

<script>
import { getPropertyIcon } from '/imports/constants/PROPERTIES.js';

export default {
	props: {
		type: String,
    color: String,
	},
	computed: {
		icon(){
			return getPropertyIcon(this.type);
		},
	},
}
</script>
