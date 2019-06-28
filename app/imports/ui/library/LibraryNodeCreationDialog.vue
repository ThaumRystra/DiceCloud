<template lang="html">
  <dialog-base :override-back-button="step === 2 ? back : undefined">
		<div slot="toolbar">{{ step === 2 ? `Add ${property.name}` : 'Add Library Content'}}</div>
		<v-window v-model="step" slot="unwrapped-content" style="height: 100%;">
			<v-window-item :value="1">
				<property-selector @select="setProperty"/>
			</v-window-item>
			<v-window-item :value="2">
				<v-card-text>
					<library-node-form :type="property && property.type"/>
				</v-card-text>
			</v-window-item>
		</v-window>

		<div slot="actions" v-if="step === 2" class="layout row justify-end">
			<v-btn flat>Insert</v-btn>
		</div>
  </dialog-base>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import PropertySelector from '/imports/ui/creature/properties/PropertySelector.vue';
import LibraryNodeForm from '/imports/ui/library/LibraryNodeForm.vue';

export default {
  data() { return {
    property: undefined,
		step: 1,
  };},
  components: {
    DialogBase,
		PropertySelector,
		LibraryNodeForm,
  },
	methods: {
		back(){
			this.step = 1;
		},
		setProperty(property){
			this.property = property;
			this.step = 2;
		}
	},
};
</script>

<style lang="css" scoped>
</style>
