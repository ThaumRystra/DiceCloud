<script setup lang="ts">
import { computed } from 'vue';
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';
import { isFinite } from 'lodash';

const props = defineProps<{ model: Record<string, any> }>();

const resolvedValue = computed(() => {
  if (!props.model.amount) return undefined;
  return props.model.amount.value !== undefined
    ? props.model.amount.value
    : props.model.amount.calculation;
});

const effectIcon = computed(() => {
  return getEffectIcon(props.model.operation, resolvedValue.value);
});

const operation = computed(() => {
  switch (props.model.operation) {
    case 'base': return 'Base value';
    case 'add': return 'Add';
    case 'mul': return 'Multiply';
    case 'min': return 'Minimum';
    case 'max': return 'Maximum';
    case 'set': return 'Set';
    case 'advantage': return 'Advantage';
    case 'disadvantage': return 'Disadvantage';
    case 'passiveAdd': return 'Passive bonus';
    case 'fail': return 'Always fail';
    case 'conditional': return 'Conditional benefit';
    default: return props.model.operation;
  }
});

const displayedValue = computed(() => {
  const value = resolvedValue.value;
  switch (props.model.operation) {
    case 'base': return value;
    case 'add': return isFinite(value) ? Math.abs(value) : value;
    case 'mul': return value;
    case 'min': return value;
    case 'max': return value;
    case 'advantage': return undefined;
    case 'disadvantage': return undefined;
    case 'passiveAdd': return isFinite(value) ? Math.abs(value) : value;
    case 'fail': return undefined;
    case 'conditional': return undefined;
    default: return undefined;
  }
});
</script>

<template lang="html">
  <div class="effect-viewer">
    <v-row dense>
      <property-field name="Operation">
        <div
          class="layout"
          style="overflow: hidden;"
        >
          <v-icon class="mr-2">
            {{ effectIcon }}
          </v-icon>
          {{ operation }}
        </div>
      </property-field>
      <property-field
        v-if="model.operation !== 'conditional'"
        name="Amount"
        :value="displayedValue || ' '"
      />
      <property-target-tags
        v-if="model.targetByTags"
        :model="model"
      />
      <property-field
        v-else
        name="Stats"
      >
        <div class="d-flex flex-wrap">
          <v-chip
            v-for="(stat, index) in model.stats"
            :key="index"
            class="ma-1"
          >
            {{ stat }}
          </v-chip>
        </div>
      </property-field>
      <property-field
        v-if="model.operation === 'conditional'"
        name="Text"
        :cols="{cols: 12}"
        :value="model.text || ' '"
      />
    </v-row>
  </div>
</template>

<style lang="css" scoped>
.icon {
  min-width: 30px;
}

.icon {
  color: inherit !important;
}

.net-effect {
  flex-grow: 0;
  flex-shrink: 0;
}

.value,
.calculation {
  min-width: 80px;
}
</style>
