<template lang="html">
	<div class="pa-1" style="background: inherit;">
		<health-bar
		:value="value"
		:max-value="maxValue"
		name="Hit Points"
		@change="healthBarChanged"
		/>
		<health-bar
		:value="50"
		:max-value="100"
		name="Temporary Hit Points"
		/>
		<health-bar
		:value="70"
		:max-value="100"
		name="Some other bar"
		@change="healthBarChanged"
		/>
		<health-bar
		:value="90"
		:max-value="100"
		name="Cow"
		/>
	</div>
</template>

<script>
	import HealthBar from '/imports/ui/properties/attributes/HealthBar.vue';
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
