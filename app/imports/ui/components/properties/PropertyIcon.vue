<template lang="html">
  <v-icon>{{icon}}</v-icon>
</template>

<script>
import { getPropertyIcon } from '/imports/constants/PROPERTIES.js';

export default {
	props: {
		type: String,
	},
	computed: {
		icon(){
			return getPropertyIcon(this.type);
		},
	},
}
</script>
