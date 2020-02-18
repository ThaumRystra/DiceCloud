<template lang="html">
	<div class="effect-viewer">
		<property-name :value="model.name" v-if="model.name"/>
		<div class="layout row align-center wrap">
			<div class="headline">
				<code style="display: block;" class="my-1" v-for="stat in model.stats">{{stat}}</code>
			</div>
			<v-tooltip bottom>
				<template v-slot:activator="{ on }">
					<v-icon v-on="on" class="mx-2" style="cursor: default;">{{effectIcon}}</v-icon>
				</template>
				<span>{{operation}}</span>
			</v-tooltip>
			<div v-if="showValue" class="headline">
				{{displayedValue}}
			</div>
		</div>
	</div>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
	import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';
	export default {
		mixins: [propertyViewerMixin],
		computed: {
			resolvedValue(){
				return this.model.result !== undefined ? this.model.result : +this.model.calculation;
			},
			effectIcon(){
				let value = this.resolvedValue;
				return getEffectIcon(this.model.operation, value);
			},
			operation(){
				switch(this.model.operation) {
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
			showValue(){
				switch(this.model.operation) {
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
			displayedValue(){
				let value = this.resolvedValue;
				switch(this.model.operation) {
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
