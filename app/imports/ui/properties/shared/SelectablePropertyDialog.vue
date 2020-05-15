<template lang="html">
  <transition-group name="slide">
    <dialog-base
      v-show="!value"
      key="left"
      class="step-1"
    >
      <v-toolbar-title slot="toolbar">
        Add Library Content
      </v-toolbar-title>
      <property-selector @select="property => $emit('input', property)" />
    </dialog-base>
    <div
      v-show="value"
      key="right"
      class="step-2"
      style="height: 100%;"
    >
      <slot />
    </div>
  </transition-group>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import PropertySelector from '/imports/ui/properties/shared/PropertySelector.vue';

export default {
  components: {
    DialogBase,
		PropertySelector,
  },
	props: {
		value: {
			type: String,
		},
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
