<script setup lang="ts">
import { computed } from 'vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import { getPropertyIcon } from '/imports/constants/PROPERTIES';
import InlineEffect from '/imports/client/ui/properties/components/effects/InlineEffect.vue';

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

const icon = computed(() => {
  if (props.model.damageType === 'healing') {
    return 'mdi-hospital-box-outline';
  } else {
    return getPropertyIcon('damage');
  }
});
</script>

<template lang="html">
  <div>
    <div
      class="d-flex align-center justify-start"
      style="height:40px;"
    >
      <v-icon
        v-if="!hideIcon"
        class="mr-2"
        :color="model.color"
        :class="selected && 'text-primary'"
      >
        {{ icon }}
      </v-icon>
      <div class="text-no-wrap text-truncate">
        {{ model.amount && model.amount.value }}
        {{ model.damageType }}<span v-if="model.damageType !== 'healing'">&nbsp;damage</span>
        <span v-if="model.target === 'self'">to self</span>
      </div>
    </div>
  </div>
</template>
