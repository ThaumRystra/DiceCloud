<template lang="html">
  <v-list two-line v-if="this.effects && this.effects.length">
  	<v-list-tile
			v-for="effect in sortedEffects"
			:class="{effect: true, disabled: !effect.enabled}"
			:id="`${_uid}-${effect._id}`"
			:key="effect._id"
			@click="(e) => click({effect, elementId: `${_uid}-${effect._id}`})"
		>
			<v-layout row align-center class="net-effect">
				<v-icon class="black--text icon">
					{{getEffectIcon(effect.operation, effect.value)}}
				</v-icon>
				<div class="value display-1  pr-2" v-if="showValue(effect.operation)">
					{{getValue(effect.operation, effect.value)}}
				</div>
				<div class="calculation body-2 pr-2" v-else>
					{{effect.calculation}}
				</div>
			</v-layout>
			<v-list-tile-content>
				<v-list-tile-title class="name">
					{{effect.name}}
				</v-list-tile-title>
				<v-list-tile-sub-title class="operation">
					{{getOperation(effect.operation)}}
				</v-list-tile-sub-title>
			</v-list-tile-content>
  	</v-list-tile>
  </v-list>
</template>

<script>
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
	import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';
	const SORT_INDEX = {
		"base": 1,
		"add": 2,
		"mul": 3,
		"min": 4,
		"max": 5,
		"advantage": 6,
		"disadvantage": 7,
		"passiveAdd": 8,
		"fail": 9,
		"conditional": 10,
	};

	export default {
		props: {
			effects: Array,
		},
		computed: {
			sortedEffects(){
				if (!this.effects || !this.effects.length) return [];
				return [...this.effects].sort(
					(a, b) => (SORT_INDEX[a.operation] || 99) - (SORT_INDEX[b.operation] || 99)
				);
			}
		},
		watch: {
			sortedEffects(newValue){
				console.log(newValue);
			}
		},
		methods: {
			click(event){
				this.$emit('click', event);
			},
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
	.net-effect {
		flex-grow: 0;
	}
	.value, .calculation {
		min-width: 80px;
	}
</style>
