<template lang="html">
  <dialog-base :override-back-button="step === 2 && back">
		<v-window v-model="step" slot="unwrapped-content" style="height: 100%;">
			<v-window-item :value="1">
				<property-selector @select="setType"/>
			</v-window-item>
			<v-window-item :value="2">
				<v-card-text>
					{{ type }}
				</v-card-text>
			</v-window-item>
		</v-window>
  </dialog-base>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import PropertySelector from '/imports/ui/components/properties/PropertySelector.vue';

export default {
  data() { return {
    type: undefined,
		step: 1,
  };},
  components: {
    DialogBase,
		PropertySelector,
  },
	methods: {
		back(){
			this.step = 1;
		},
		setType(type){
			this.type = type;
			this.step = 2;
		}
	},
};
</script>

<style lang="css" scoped>
</style>
