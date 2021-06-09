<template lang="html">
  <v-icon v-if="value !== undefined">
    {{ displayedIcon }}
  </v-icon>
</template>

<script lang="js">
export default {
	props: {
		value: Number,
	},
	computed: {
		displayedIcon(){
			let value = this.value;
			if (value == 0.5){
				return 'brightness_2';
			} else if (value == 1) {
				return 'brightness_1'
			} else if (value == 2){
				return 'album'
			} else {
				return 'radio_button_unchecked';
			}
		}
	}
}
</script>
