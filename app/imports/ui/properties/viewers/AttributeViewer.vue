<template lang="html">
	<div class="attribute-viewer">
		<div v-if="model.value !== undefined">
			<div class="display-3" v-if="model.damage !== undefined">
				{{model.value - model.damage}} / {{model.value}}
			</div>
			<div v-else>
				{{model.value}}
			</div>
		</div>
		<div v-if="model.mod !== undefined">
			{{numberToSignedString(model.mod)}}
		</div>
		<div class="title">
			{{model.name}}
		</div>
		<div>
			<code>{{model.variableName}}</code>
		</div>
		<div>
			{{model.attributeType}}
		</div>
		<div>
			Base value: {{model.baseValue}}
		</div>
		<div v-if="reset">
			{{reset}}
		</div>
		<div v-if="model.resetMultiplier">
			Reset multiplier: {{model.resetMultiplier}}
		</div>
		<p v-if="model.description">
			{{model.description}}
		</p>
	</div>
</template>

<script>
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';

	export default {
		props: {
			model: Object,
			required: true,
		},
		methods: {
			numberToSignedString,
		},
		computed: {
			reset(){
				let reset = this.model.reset
				if (reset === 'shortRest'){
					return 'Reset on a short rest';
				} else if (reset === 'longRest'){
					return 'Reset on a long rest';
				}
			}
		}
	}
</script>

<style lang="css" scoped>
	.ability-value {
		font-weight: 600;
		font-size: 24px !important;
		color: rgba(0, 0, 0, 0.54);
	}
	.mod, .ability-value {
		text-align: center;
		width: 100%;
	}
	.attribute-value {
		text-align: center;
	}
</style>
