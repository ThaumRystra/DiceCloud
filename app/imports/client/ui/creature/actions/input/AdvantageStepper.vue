<template>
  <div class="d-flex align-center advantage-stepper">
    <v-btn
      icon
      :disabled="clampedValue <= -max"
      aria-label="Decrease advantage"
      @click="emitInput(clampedValue - 1)"
    >
      <v-icon>mdi-minus</v-icon>
    </v-btn>
    <div
      class="text-center mx-2 advantage-label"
      :class="{ 'accent--text': clampedValue !== 0 }"
    >
      {{ label }}
    </div>
    <v-btn
      icon
      :disabled="clampedValue >= max"
      aria-label="Increase advantage"
      @click="emitInput(clampedValue + 1)"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-btn
      icon
      small
      :disabled="clampedValue === 0"
      aria-label="Reset advantage"
      @click="emitInput(0)"
    >
      <v-icon small>
        mdi-restore
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="js">
import RA_DICE from '/imports/constants/RA_DICE';

export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      max: RA_DICE.maxAdvantage,
    };
  },
  computed: {
    clampedValue() {
      return this.clamp(this.value);
    },
    label() {
      const value = this.clampedValue;
      if (value > 0) return `Advantage +${value}`;
      if (value < 0) return `Disadvantage −${Math.abs(value)}`;
      return 'Normal';
    },
  },
  methods: {
    clamp(value) {
      const num = Math.trunc(Number(value));
      if (!Number.isFinite(num)) return 0;
      return Math.max(-this.max, Math.min(this.max, num)) || 0;
    },
    emitInput(value) {
      this.$emit('input', this.clamp(value));
    },
  },
};
</script>

<style lang="css" scoped>
.advantage-label {
  min-width: 140px;
}
</style>
