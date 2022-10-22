<template lang="html">
  <v-icon v-if="value !== undefined">
    {{ displayedIcon }}
  </v-icon>
</template>

<script lang="js">
import getProficiencyIcon from '/imports/ui/utility/getProficiencyIcon.js';

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
