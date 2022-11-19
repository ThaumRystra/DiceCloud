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
import SelectablePropertyDialog from '/imports/client/ui/properties/shared/SelectablePropertyDialog.vue';
import LibraryNodeInsertForm from '/imports/client/ui/library/LibraryNodeInsertForm.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';

export default {
  components: {
    SelectablePropertyDialog,
    LibraryNodeInsertForm,
  },
  data() {
    return {
      type: undefined,
    };
  },
  methods: {
    getPropertyName,
  },
};
</script>

<style lang="css" scoped>

</style>
