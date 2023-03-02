<template>
  <v-icon v-if="value !== undefined">
    {{ displayedIcon }}
  </v-icon>
</template>

<script>
import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon.js';

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
