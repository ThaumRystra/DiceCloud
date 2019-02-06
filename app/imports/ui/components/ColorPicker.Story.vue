<template lang="html">
	<v-layout justify-center>
		<color-picker v-model="color"/>
	</v-layout>
</template>

<script>
	import ColorPicker from '/imports/ui/components/ColorPicker.vue';

	export default {
		data(){ return {
			color: '#CE93D8',
		}},
		components: {
			ColorPicker,
		},
		watch: {
			color(newColor){
				console.log(`%c${newColor}`, `background: ${newColor};`);
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
