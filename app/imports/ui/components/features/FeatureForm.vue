<template lang="html">
  <div>
  	<text-field
			label="Name"
			:value="feature.name"
			@change="(name, ack) => $emit('update', {name}, ack)"
			:error-messages="errors.name"
			:debounce-time="debounceTime"
		/>
		<smart-select
			label="Enabled"
			:items="enabledOptions"
			:value="enabledStatus"
			:error-messages="errors.enabled || errors.alwaysEnabled"
			:menu-props="{auto: true, lazy: true}"
			@change="changeEnabled"
			:debounce-time="debounceTime"
		/>
		<text-area
			label="Description"
			:value="feature.description"
			:error-messages="errors.description"
			@change="(description, ack) => $emit('update', {description}, ack)"
			:debounce-time="debounceTime"
		/>
  </div>
</template>

<script>
	export default {
		props: {
			feature: {
				type: Object,
				default: () => ({}),
			},
			errors: {
				type: Object,
				default: () => ({}),
			},
			debounceTime: Number,
		},
		data(){ return{
			enabledOptions: [
				{
					text: 'Always enabled',
					value: 'always',
				}, {
					text: 'Enabled',
					value: 'enabled',
				}, {
					text: 'Disabled',
					value: 'disabled',
				}
			],
		}},
		computed: {
			enabledStatus(){
				if (!this.feature) return;
				if (this.feature.alwaysEnabled) return 'always';
				if (this.feature.enabled) return 'enabled';
				return 'disabled';
			},
		},
		methods: {
			changeEnabled(value, ack){
				if (value === 'always'){
					this.$emit('update', {enabled: true, alwaysEnabled: true}, ack);
				} else if (value === 'enabled'){
					this.$emit('update', {enabled: true, alwaysEnabled: false}, ack);
				} else if (value === 'disabled'){
					this.$emit('update', {enabled: false, alwaysEnabled: false}, ack);
				}
			}
		}
	};
</script>

<style lang="css" scoped>
</style>
