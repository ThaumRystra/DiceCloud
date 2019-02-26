<template lang="html">
	<v-list-tile class="spell-slot-list-tile" :class="{hover}">

		<v-list-tile-action>

			<div class="layout row align-center" v-if="value > 4">
				<div class="buttons layout column justify-center">
					<v-btn icon small :disabled="currentValue >= value" @click="increment(1)">
						<v-icon>arrow_drop_up</v-icon>
					</v-btn>
					<v-btn icon small :disabled="currentValue <= 0" @click="increment(-1)">
						<v-icon>arrow_drop_down</v-icon>
					</v-btn>
				</div>
				<div class="layout row value" style="align-items: baseline;">
					<div class="display-1">{{currentValue}}</div>
					<div class="title ml-2 max-value">/{{value}}</div>
				</div>
			</div>

			<div class="layout row align-center justify-end slot-buttons" v-else>
				<v-btn
					icon
					small
					v-for="i in value"
					:disabled="!(i === currentValue || i === currentValue + 1)"
					:key="i"
					@click="increment(i > currentValue ? 1 : -1)"
				>
					<v-icon>{{
						i > currentValue ?
						'radio_button_unchecked' :
						'radio_button_checked'
					}}</v-icon>
				</v-btn>
			</div>

		</v-list-tile-action>

		<v-list-tile-content
			class="content ml-2"
			@click="click"
			@mouseover="hover = true"
			@mouseleave="hover = false"
		>
			<v-list-tile-title>
				{{name}}
			</v-list-tile-title>
		</v-list-tile-content>
	</v-list-tile>
</template>

<script>
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
export default {
	data(){ return{
		hover: false,
	}},
	props: {
		_id: String,
		name: String,
		color: String,
		value: Number,
		adjustment: {
			type: Number,
			default: 0,
		},
	},
	computed: {
		currentValue(){
			return this.value + (this.adjustment || 0);
		},
	},
	methods: {
		signed: numberToSignedString,
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
	.spell-slot-list-tile {
		background: inherit;
	}
	.spell-slot-list-tile >>> .v-list__tile {
		height: 56px;
	}
	.v-list__tile__action {
		width: 112px;
		flex-shrink: 0;
	}
	.slot-buttons > .v-btn {
		margin: 0;
		flex-shrink: 1;
	}
	.buttons {
		height: 100%;
	}
	.buttons > .v-btn {
		margin: 0;
	}
	.spell-slot-list-tile.hover {
		background: #f5f5f5 !important;
	}
	.theme--dark .spell-slot-list-tile.hover {
		background: #515151 !important;
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
