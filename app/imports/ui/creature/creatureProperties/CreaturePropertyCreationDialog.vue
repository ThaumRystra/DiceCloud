<template lang="html">
  <selectable-property-dialog :value="forcedType || type">
    <creature-property-insert-form
      :type="forcedType || type"
      :property-name="getPropertyName(forcedType || type)"
      @back="back"
    />
  </selectable-property-dialog>
</template>

<script>
import SelectablePropertyDialog from '/imports/ui/properties/shared/SelectablePropertyDialog.vue';
import CreaturePropertyInsertForm from '/imports/ui/creature/creatureProperties/CreaturePropertyInsertForm.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';

export default {
  components: {
    SelectablePropertyDialog,
		CreaturePropertyInsertForm,
  },
  props: {
    forcedType: {
      type: String,
      default: undefined,
    },
  },
  data() { return {
    type: undefined,
  };},
	methods: {
		getPropertyName,
    back(){
      if (this.forcedType){
        this.$store.dispatch('popDialogStack');
      } else {
        this.type = undefined;
      }
    },
	},
};
</script>

<style lang="css" scoped>
</style>
