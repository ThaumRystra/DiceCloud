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
		<property-name :value="model.name"/>
		<property-variable-name :value="model.variableName"/>
		<p v-if="reset">
			{{reset}}
		</p>
		<effect-viewer
			:model="{
				result: model.baseValue,
				operation: 'base'
			}"
		/>
		<property-description :value="model.description"/>
	</div>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
	import EffectViewer from '/imports/ui/properties/viewers/EffectViewer.vue';

	export default {
		mixins: [propertyViewerMixin],
		components: {
			EffectViewer,
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
