<template lang="html">
	<selectable-property-dialog v-model="type">
		<creature-property-insert-form
			:type="type"
			:property-name="getPropertyName(type)"
			@back="type = undefined"
		/>
	</selectable-property-dialog>
</template>

<script>
import SelectablePropertyDialog from '/imports/ui/properties/components/SelectablePropertyDialog.vue';
import CreaturePropertyInsertForm from '/imports/ui/creature/creatureProperties/CreaturePropertyInsertForm.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';

export default {
  data() { return {
    type: undefined,
  };},
  components: {
    SelectablePropertyDialog,
		CreaturePropertyInsertForm,
  },
	methods: {
		getPropertyName,
	},
};
</script>

<style lang="css" scoped>
</style>
