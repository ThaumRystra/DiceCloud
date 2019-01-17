<template lang="html">
	<health-bar
		:value="value"
		:max-value="maxValue"
		@change="healthBarChanged"
	/>
</template>

<script>
	import HealthBar from '/imports/ui/components/HealthBar.vue';
	export default {
		data(){return{
			value: 100,
			maxValue: 100,
		}},
		components: {
			HealthBar,
		},
		methods: {
			healthBarChanged(e){
				let val = e.value;
				// Apply the change
				if (e.type === 'set'){
					this.value = val;
				} else if (e.type === 'increment') {
					this.value += val;
				}
				// Clamp the value
				if (this.value < 0){
					this.value = 0;
				}
				if (this.value > this.maxValue){
					this.value = this.maxValue;
				}
			},
		},
	}
</script>

<style lang="css" scoped>
</style>
