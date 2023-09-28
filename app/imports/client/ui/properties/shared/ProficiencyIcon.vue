<template lang="html">
  <v-icon v-if="value !== undefined">
    {{ displayedIcon }}
  </v-icon>
</template>

<script lang="js">
import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon';

export default {
  props: {
    value: {
      type: Number,
      default: undefined,
    },
  },
  computed: {
    displayedIcon(){
      return getProficiencyIcon(this.value);
    }
  }
}
</script>
