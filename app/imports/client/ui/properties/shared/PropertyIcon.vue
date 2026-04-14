<script setup lang="ts">
import { computed } from 'vue';
import { getPropertyIcon } from '/imports/constants/PROPERTIES';

const props = withDefaults(defineProps<{
  model?: Record<string, any>;
  color?: string;
  disabled?: boolean;
}>(), {
  model: () => ({}),
  color: undefined,
  disabled: false,
});

const icon = computed(() => getPropertyIcon(props.model?.type));
</script>

<template lang="html">
  <svg-icon
    v-if="model.icon"
    :shape="model.icon.shape"
    :color="color"
    :class="{disabled}"
  />
  <v-icon
    v-else
    :color="color"
    :class="{disabled}"
  >
    {{ icon }}
  </v-icon>
</template>

<style lang="css" scoped>
.svg-icon.disabled,
.v-icon.disabled {
  opacity: 0.2;
}
</style>
