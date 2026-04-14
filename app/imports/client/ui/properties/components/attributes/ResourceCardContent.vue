<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';

const props = defineProps<{
  model: Record<string, any>;
  hover?: boolean;
}>();

const emit = defineEmits(['click', 'change']);
const context = inject('context', {});

const optimisticIncrement = ref(0);

const optimisticValue = computed(() => props.model?.value + optimisticIncrement.value);

watch(() => props.model.value, () => {
  optimisticIncrement.value = 0;
});

function click(e: Event) {
  emit('click', e);
}

function increment(value: number, ack?: Function) {
  emit('change', { type: 'increment', value, ack });
}
</script>

<template>
  <div class="d-flex">
    <div class="buttons layout column justify-center pl-3">
      <smart-btn
        icon
        small
        :disabled="(optimisticValue >= model.total && !model.ignoreUpperLimit) || context.editPermission === false"
        @clicks="(times, ack) => increment(times, ack)"
        @click="optimisticIncrement += 1"
      >
        <v-icon>mdi-chevron-up</v-icon>
      </smart-btn>
      <smart-btn
        icon
        small
        :disabled="(optimisticValue <= 0 && !model.ignoreLowerLimit) || context.editPermission === false"
        @clicks="(times, ack) => increment(-1 * times, ack)"
        @click="optimisticIncrement -= 1"
      >
        <v-icon>mdi-chevron-down</v-icon>
      </smart-btn>
    </div>
    <div class="d-flex align-center value pl-2 pr-3">
      <div class="text-h4">
        {{ optimisticValue }}
      </div>
      <div
        v-if="model.total !== 0"
        class="text-h6 ml-2 max-value"
      >
        /{{ model.total }}
      </div>
    </div>
    <div
      class="content layout align-center pr-3"
      @click="click"
      @mouseover="$emit('mouseover')"
      @mouseleave="$emit('mouseleave')"
    >
      <div class="text-truncate ">
        {{ model.name }}
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.buttons,
.value {
  flex-shrink: 0;
  flex-grow: 0;
}
.buttons>.v-btn {
  margin: 0;
}
.content {
  cursor: pointer;
}
.max-value {
  color: rgba(0, 0, 0, .54);
}
.v-theme--dark .max-value {
  color: rgba(255, 255, 255, 0.54);
}
</style>
