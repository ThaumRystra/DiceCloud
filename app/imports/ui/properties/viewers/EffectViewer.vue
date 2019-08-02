<template lang="html">
	<v-list-tile
		class="effect-list-tile"
		:class="{disabled: !model.enabled}"
		:data-id="model._id"
	>
		<v-layout row align-center class="net-effect">
			<v-icon class="icon">{{getEffectIcon(model.operation, model.result)}}</v-icon>
			<div class="value display-1  pr-2" v-if="showValue(model.operation) && model.result !== undefined">
				{{getValue(model.operation, model.result)}}
			</div>
			<div class="calculation body-2 pr-2" v-else>
				{{model.operation === 'conditional' ? model.calculation : ''}}
			</div>
		</v-layout>
		<v-list-tile-content>
			<v-list-tile-title class="stat" v-if="model.showStatName">
				{{model.statName}}
			</v-list-tile-title>
			<v-list-tile-title class="name" v-else>
				{{model.name}}
			</v-list-tile-title>
			<v-list-tile-sub-title class="operation">
				{{getOperation(model.operation)}}
			</v-list-tile-sub-title>
		</v-list-tile-content>
	</v-list-tile>
</template>

<script>
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
	import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';
	export default {
		props: {
			model: {
				type: Object,
				required: true,
			},
		},
		methods: {
			getEffectIcon,
			getOperation(op, value){
				switch(op) {
					case 'base': return 'Base value';
					case 'add': return 'Add';
					case 'mul': return 'Multiply';
					case 'min': return 'Minimum';
					case 'max': return 'Maximum';
					case 'advantage': return 'Advantage';
					case 'disadvantage': return 'Disadvantage';
					case 'passiveAdd': return 'Passive bonus';
					case 'fail': return 'Always fail';
					case 'conditional': return 'Conditional benefit' ;
				}
			},
			showValue(op){
				switch(op) {
					case 'base': return true;
					case 'add': return true;
					case 'mul': return true;
					case 'min': return true;
					case 'max': return true;
					case 'advantage': return false;
					case 'disadvantage': return false;
					case 'passiveAdd': return true;
					case 'fail': return false;
					case 'conditional': return false;
				}
			},
			getValue(op, value){
				switch(op) {
					case 'base': return value;
					case 'add': return Math.abs(value);
					case 'mul': return value;
					case 'min': return value;
					case 'max': return value;
					case 'advantage': return;
					case 'disadvantage': return;
					case 'passiveAdd': return Math.abs(value);
					case 'fail': return;
					case 'conditional': return;
				}
			}
		},
	};
</script>

<style lang="css" scoped>
	.icon {
		min-width: 30px;
	}
	.icon {
		color: inherit !important;
	}
	.net-effect {
		flex-grow: 0;
		flex-shrink: 0;
	}
	.value, .calculation {
		min-width: 80px;
	}
</style>
