<template lang="html">
	<v-card>
		<div class="layout row align-center" :class="{hover}">
			<div class="buttons layout column justify-center">
				<v-btn icon flat :disabled="currentValue >= value" @click="increment(1)">
					<v-icon>arrow_drop_up</v-icon>
				</v-btn>
				<v-btn icon flat :disabled="currentValue <= 0" @click="increment(-1)">
					<v-icon>arrow_drop_down</v-icon>
				</v-btn>
			</div>
			<div class="layout row value" style="align-items: baseline;">
				<div class="display-1">{{currentValue}}</div>
				<div class="title ml-2 max-value">/{{value}}</div>
			</div>
			<v-card-text
				class="content text-truncate"
				@click="click"
				@mouseover="hover = true"
				@mouseleave="hover = false"
			>
				{{name}}
			</v-card-text>
		</div>
	</v-card>
</template>

<script>
	export default {
		data(){ return{
			hover: false,
		}},
		props: {
			_id: String,
			name: String,
			color: String,
			value: Number,
			adjustment: Number,
		},
		computed: {
			currentValue(){
				return this.value + (this.adjustment || 0);
			},
		},
		methods: {
			click(e){
				this.$emit('click', e);
			},
			increment(value){
				this.$emit('change', {type: 'increment', value})
			},
		},
	};
</script>

<style lang="css" scoped>
	.buttons {
		height: 100%;
	}
	.buttons, .value {
		flex-shrink: 0;
	}
	.buttons > .v-btn {
		margin: 0;
	}
	.content {
		cursor: pointer;
	}
	.max-value {
		color: rgba(0,0,0,.54);
	}
	.theme--dark .max-value {
		color: rgba(255, 255, 255, 0.54);
	}
</style>
