<template lang="html">
  <div>
  	<text-field
			label="Name"
			:value="feature.name"
			@change="(name, ack) => $emit('change', {name}, ack)"
			:error-messages="errors.name"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Used"
			type="number"
			:value="feature.used"
			@change="(used, ack) => $emit('change', {used}, ack)"
			:error-messages="errors.used"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Uses"
			:value="feature.uses"
			@change="(uses, ack) => $emit('change', {uses}, ack)"
			:error-messages="errors.uses"
			:debounce-time="debounceTime"
		/>
		<smart-select
			label="Reset"
			clearable
			:items="resetOptions"
			:value="feature.reset"
			:error-messages="errors.reset"
			:menu-props="{auto: true, lazy: true}"
			@change="(reset, ack) => $emit('change', {reset}, ack)"
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
			@change="(description, ack) => $emit('change', {description}, ack)"
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
			resetOptions: [
				{
					text: 'Short rest',
					value: 'shortRest',
				}, {
					text: 'Long rest',
					value: 'longRest',
				}
			],
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
					this.$emit('change', {enabled: true, alwaysEnabled: true}, ack);
				} else if (value === 'enabled'){
					this.$emit('change', {enabled: true, alwaysEnabled: false}, ack);
				} else if (value === 'disabled'){
					this.$emit('change', {enabled: false, alwaysEnabled: false}, ack);
				}
			}
		}
	};
</script>

<style lang="css" scoped>
</style>
