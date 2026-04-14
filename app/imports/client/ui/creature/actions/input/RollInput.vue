<script setup lang="ts">
import VerticalHex from '/imports/client/ui/components/VerticalHex.vue';

const props = defineProps<{
  value?: any[];
  dice: any[];
  deterministicDiceRoller: Function;
}>();

const emit = defineEmits(['input', 'continue']);

function rollDice() {
  const values = props.deterministicDiceRoller(props.dice);
  emitInput(values);
  emit('continue');
}

function emitInput(e: any) {
  emit('input', e || 0);
}
</script>

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
