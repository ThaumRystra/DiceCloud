<template lang="html">
	<transition-group name="slide">
		<dialog-base v-show="!value" class="step-1" key="left">
			<div slot="toolbar">Add Library Content</div>
			<property-selector @select="property => $emit('input', property)"/>
		</dialog-base>
		<div
			v-show="value"
			class="step-2"
			style="height: 100%;"
			key="right"
		>
			<slot/>
		</div>
	</transition-group>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import PropertySelector from '/imports/ui/properties/PropertySelector.vue';

export default {
	props: {
		value: {
			type: String,
		},
	},
  components: {
    DialogBase,
		PropertySelector,
  },
};
</script>

<style lang="css" scoped>
	.slide-enter-active, .slide-leave-active {
		transition: transform .3s ease;
	}
	.slide-enter-active.step-1, .slide-leave-active.step-1{
		position: absolute;
	}
	.slide-enter.step-1, .slide-leave-to.step-1 {
		transform: translateX(-100%);
	}
	.slide-enter.step-2, .slide-leave-to.step-2 {
		transform: translateX(100%);
	}
</style>
