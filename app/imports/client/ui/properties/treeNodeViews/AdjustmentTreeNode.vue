<script setup lang="ts">
import { computed } from 'vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';

const props = withDefaults(defineProps<{
  model?: Record<string, any>;
  selected?: boolean;
  hideIcon?: boolean;
}>(), {
  model: () => ({}),
  selected: false,
  hideIcon: false,
});

const title = computed(() => {
  const model = props.model;
  if (!model) return;
  if (model.name) return model.name;
  const prop = (PROPERTIES as any)[model.type];
  return prop && prop.name;
});

const amount = computed(() =>
  props.model.amount && props.model.amount.value
);

const absoluteAmount = computed(() => {
  if (typeof amount.value === 'number') {
    return Math.abs(amount.value);
  } else {
    return amount.value;
  }
});
</script>

<template lang="html">
  <div class="d-flex align-center justify-start">
    <property-icon
      v-if="!hideIcon"
      class="mr-2"
      :model="model"
      :class="selected && 'text-primary'"
      :color="model.color"
    />
    <div
      class="text-no-wrap text-truncate"
    >
      <template v-if="model.amount && model.amount.calculation">
        <span v-if="amount < 0">+</span>
        {{ absoluteAmount }} {{ model.stat }}
        <span v-if="typeof absoluteAmount === 'string' || amount >= 0">
          damage
        </span>
        <span v-if="model.target === 'self'">
          to self
        </span>
      </template>
      <template v-else>
        <span>{{ model.stat || 'Attribute' }} damage</span>
      </template>
    </div>
  </div>
</template>
