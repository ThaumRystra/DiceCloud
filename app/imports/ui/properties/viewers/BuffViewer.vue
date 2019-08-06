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
		<property-name :value="model.name"/>
		<property-field name="Duration" :value="model.duration"/>
		<div>
			<div class="subheading">
				Effects
			</div>
			<div
				class="layout row center mb-2 ml-2"
				v-for="effect in model.effects"
			>
				<property-icon type="effect" class="mr-2"/>
				<effect-viewer
					operation="base"
					:model="effect"
				/>
			</div>
		</div>
		<property-description :value="model.description"/>
	</div>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
	import EffectViewer from '/imports/ui/properties/viewers/EffectViewer.vue';
	import PropertyIcon from '/imports/ui/properties/PropertyIcon.vue';

	export default {
		mixins: [propertyViewerMixin],
		components: {
			EffectViewer,
			PropertyIcon,
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
