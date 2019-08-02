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
		<h1 class="display-1">
			{{model.name}}
		</h1>
		<p class="my-2">
			<code>{{model.variableName}}</code>
		</p>
		<p v-if="reset">
			{{reset}}
		</p>
		<effect-list-tile
			class="mb-3"
			operation="base"
			:result="model.baseValue"
			:name="model.attributeType"
		/>
		<p v-if="model.description">
			{{model.description}}
		</p>
	</div>
</template>

<script>
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
	import EffectListTile from '/imports/ui/properties/viewers/shared/effects/EffectListTile.vue';

	export default {
		components: {
			EffectListTile,
		},
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
					return `Reset${
						this.model.resetMultiplier && ' x' + this.model.resetMultiplier
					} on a short rest`;
				} else if (reset === 'longRest'){
					return `Reset${
						this.model.resetMultiplier && ' x' + this.model.resetMultiplier
					} on a long rest`;
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
