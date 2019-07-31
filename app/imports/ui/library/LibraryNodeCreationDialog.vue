<template lang="html">
	<transition-group name="slide">
		<dialog-base v-show="step == 1" class="step-1" key="left">
			<div slot="toolbar">Add Library Content</div>
			<property-selector @select="setProperty"/>
		</dialog-base>
		<library-node-insert-form
			v-show="step == 2"
			class="step-2"
			key="right"
			:type="property && property.type"
			:property-name="property && property.name"
			@back="step = 1"
		/>
	</transition-group>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import PropertySelector from '/imports/ui/properties/PropertySelector.vue';
import LibraryNodeInsertForm from '/imports/ui/library/LibraryNodeInsertForm.vue';

export default {
  data() { return {
    property: undefined,
		step: 1,
  };},
  components: {
    DialogBase,
		PropertySelector,
		LibraryNodeInsertForm,
  },
	methods: {
		setProperty(property){
			this.property = property;
			this.step = 2;
		}
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
