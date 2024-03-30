<template>
  <div
    class="d-flex flex-column justify-center align-center"
    @click="rollDice"
  >
    <p
      v-for="(die, index) in dice"
      :key="index"
    >
      {{ die.number }}d{{ die.diceSize }}
    </p>
  </div>
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
    deterministicDiceRoller: {
      type: Function,
      required: true,
    }
  },
  methods: {
    rollDice() {
      const values = this.deterministicDiceRoller(this.dice);
      this.emitInput(values);
      this.$emit('continue');
    },
    emitInput(e) {
      e = e || 0;
      this.$emit('input', e)
    }
  }
};
</script>
