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
  if (Number.isFinite(model.quantity) && model.quantity !== 1) {
    if (model.plural) {
      return `${model.quantity} ${model.plural}`;
    } else if (model.name) {
      return `${model.quantity} ${model.name}`;
    }
  } else if (model.name) {
    return model.name;
  }
  const prop = (PROPERTIES as any)[model.type];
  return prop && prop.name;
});
</script>

<template lang="html">
  <div class="d-flex align-center justify-start">
    <property-icon
      v-if="!hideIcon"
      class="mr-2"
      :model="model"
      :color="model.color"
      :class="selected && 'text-primary'"
    />
    <v-icon
      v-if="model.equipped && !hideIcon"
      class="mr-2"
      :class="selected && 'text-primary'"
      size="small"
    >
      mdi-account-arrow-left
    </v-icon>
    <div
      class="text-no-wrap text-truncate"
      :class="model.equipped && 'body-2'"
    >
      {{ title }}
    </div>
  </div>
</template>

<style lang="css" scoped>
</style>
