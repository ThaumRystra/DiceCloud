<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';
import { isFinite } from 'lodash';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

const props = defineProps<{
  hideBreadcrumbs?: boolean;
  effectId: string;
}>();

const emit = defineEmits(['click']);
const attrs = useAttrs();

const { result: model } = autorun(() =>
  CreatureProperties.findOne(props.effectId)
);

const hasClickListener = computed(() => !!attrs.onClick);

const operation = computed(() => {
  if (!model.value) return '';
  switch (model.value.operation) {
    case 'base': return 'Base value';
    case 'add': return 'Add';
    case 'mul': return 'Multiply';
    case 'min': return 'Minimum';
    case 'max': return 'Maximum';
    case 'advantage': return 'Advantage';
    case 'disadvantage': return 'Disadvantage';
    case 'passiveAdd': return 'Passive bonus';
    case 'fail': return 'Always fail';
    case 'conditional': return 'Conditional benefit';
    default: return '';
  }
});

const resolvedValue = computed(() => {
  if (!model.value) return undefined;
  const amount = model.value.amount;
  if (!amount) return undefined;
  return amount.value !== undefined ? amount.value : amount.calculation;
});

const effectIcon = computed(() => {
  if (!model.value) return undefined;
  return getEffectIcon(model.value.operation, resolvedValue.value);
});

const showValue = computed(() => {
  if (!model.value) return false;
  switch (model.value.operation) {
    case 'base': return true;
    case 'add': return true;
    case 'mul': return true;
    case 'min': return true;
    case 'max': return true;
    case 'advantage': return false;
    case 'disadvantage': return false;
    case 'passiveAdd': return true;
    case 'fail': return false;
    case 'conditional': return false;
    default: return false;
  }
});

const displayedText = computed(() => {
  if (!model.value) return undefined;
  if (model.value.operation === 'conditional') {
    return model.value.text || model.value.name || operation.value;
  } else {
    return model.value.name || operation.value;
  }
});

const displayedValue = computed(() => {
  if (!model.value) return undefined;
  const value = resolvedValue.value;
  switch (model.value.operation) {
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

function click(e: Event) {
  emit('click', e);
}
</script>

<template lang="html">
  <v-list-item
    class="effect-viewer layout align-center"
    density="compact"
    v-on="!hideBreadcrumbs ? {click} : {}"
  >
    <div class="effect-icon">
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-icon
            class="mx-2"
            style="cursor: default;"
            v-bind="props"
          >
            {{ effectIcon }}
          </v-icon>
        </template>
        <span>{{ operation }}</span>
      </v-tooltip>
    </div>
    <v-list-item-title>
      <span
        class="effect-value mr-2"
      >
        {{ displayedValue }}
      </span>
      {{ displayedText }}
    </v-list-item-title>
  </v-list-item>
</template>

<style lang="css" scoped>
  .icon, .effect-icon {
    min-width: 20px;
  }
  .icon {
    color: inherit !important;
  }
  .net-effect {
    flex-grow: 0;
    flex-shrink: 0;
  }
  .effect-value {
    min-width: 30px;
    text-align: center;
  }
</style>
