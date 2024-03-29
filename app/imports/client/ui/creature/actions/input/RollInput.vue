<template>
  <div
    class="d-flex flex-column justify-center align-center"
    @click="rollDice"
  />
</template>

<script lang="js">
import VerticalHex from '/imports/client/ui/components/VerticalHex.vue';

export default {
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    dice: {
      type: Array,
      required: true,
    },
  },
  methods: {
    rollDice() {
      
    },
    emitInput(e) {
      e = e || 0;
      this.$emit('input', e)
    }
  }
};
</script>
