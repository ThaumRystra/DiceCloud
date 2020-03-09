<template lang="html">
  <div class="feature-form">
  	<text-field
			label="Name"
			:value="model.name"
			@change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
			:error-messages="errors.name"
			:debounce-time="debounceTime"
		/>
		<!--
		<smart-select
			label="Enabled"
			:items="enabledOptions"
			:value="enabledStatus"
			:error-messages="errors.enabled || errors.alwaysEnabled"
			:menu-props="{auto: true, lazy: true}"
			@change="changeEnabled"
			:debounce-time="debounceTime"
		/>-->
		<text-area
			label="Description"
			:value="model.description"
			:error-messages="errors.description"
			@change="(value, ack) => $emit('change', {path: ['description'], value, ack})"
			:debounce-time="debounceTime"
		/>
  </div>
</template>

<script>
	export default {
		props: {
			model: {
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
				if (!this.model) return;
				if (this.model.alwaysEnabled) return 'always';
				if (this.model.enabled) return 'enabled';
				return 'disabled';
			},
		},
		methods: {
			changeEnabled(value, ack){
				let change = ({enabled, alwaysEnabled}) => {
					this.$emit('change', {path: ['enabled'], value: enabled, ack});
					this.$emit('change', {path: ['alwaysEnabled'], value: alwaysEnabled, ack});
				}
				if (value === 'always'){
					change({enabled: true, alwaysEnabled: true});
				} else if (value === 'enabled'){
					change({enabled: true, alwaysEnabled: false});
				} else if (value === 'disabled'){
					change({enabled: false, alwaysEnabled: false});
				}
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
