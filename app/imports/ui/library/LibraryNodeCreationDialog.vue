<template lang="html">
	<selectable-property-dialog v-model="type">
		<library-node-insert-form
			:type="type"
			:property-name="getPropertyName(type)"
			@back="type = undefined"
		/>
	</selectable-property-dialog>
</template>

<script lang="js">
import SelectablePropertyDialog from '/imports/ui/properties/shared/SelectablePropertyDialog.vue';
import LibraryNodeInsertForm from '/imports/ui/library/LibraryNodeInsertForm.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';

export default {
  data() { return {
    type: undefined,
  };},
  components: {
    SelectablePropertyDialog,
		LibraryNodeInsertForm,
  },
	methods: {
		getPropertyName,
	},
};
</script>

<style lang="css" scoped>
</style>
