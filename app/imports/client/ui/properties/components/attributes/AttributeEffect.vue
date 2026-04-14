<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';
import Breadcrumbs from '/imports/client/ui/creature/creatureProperties/Breadcrumbs.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { isFinite } from 'lodash';

const props = defineProps<{
  hideBreadcrumbs?: boolean;
  model: Record<string, any>;
  attribute: Record<string, any>;
}>();

const emit = defineEmits(['click']);
const attrs = useAttrs();

const hasClickListener = computed(() => !!attrs.onClick);

const operation = computed(() => {
  if (props.model.type === 'pointBuy' || props.model.type === 'attribute') {
    return 'base';
  }
  return props.model.operation;
});

const resolvedValue = computed(() => {
  const amount = props.model.amount;
  if (!amount) return undefined;
  return amount.value !== undefined ? amount.value : amount.calculation;
});

const effectIcon = computed(() => getEffectIcon(operation.value, resolvedValue.value));

const operationText = computed(() => {
  switch (operation.value) {
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

const showValue = computed(() => {
  switch (operation.value) {
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
  if (operation.value === 'conditional') {
    return props.model.text || props.model.name || operation.value;
  } else {
    return props.model.name || operation.value;
  }
});

const displayedValue = computed(() => {
  const value = resolvedValue.value;
  if (props.model.type === 'pointBuy') {
    return props.model.values?.find((row: any) => props.attribute.variableName === row.variableName)?.value;
  } else if (props.model.type === 'attribute') {
    return props.model.baseValue?.value;
  }
  switch (operation.value) {
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

const { result: ancestors } = autorun(() => {
  const prop = CreatureProperties.findOne(props.model._id);
  return (prop && prop.ancestors) || [];
});

function click(e: Event) {
  emit('click', e);
}
</script>

<template lang="html">
  <v-list-item
    class="effect-viewer layout align-center"
    v-on="!hideBreadcrumbs ? {click} : {}"
  >
    <div class="effect-icon">
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-icon
            class="mx-2"
            style="cursor: default;"
            size="large"
            v-bind="props"
          >
            {{ effectIcon }}
          </v-icon>
        </template>
        <span>{{ operation }}</span>
      </v-tooltip>
    </div>
    <div
      class="text-h4 effect-value mr-2"
    >
      {{ displayedValue }}
    </div>
    <div class="d-flex flex-column my-2">
      <div class="text-body-1 mb-1">
        {{ displayedText }}
      </div>
      <div v-if="!hideBreadcrumbs && ancestors">
        <breadcrumbs
          :model="{...model, ancestors}"
          class="text-caption"
          no-links
          no-icons
          style="margin-bottom: 0"
        />
      </div>
    </div>
  </v-list-item>
</template>

<style lang="css" scoped>
  .icon, .effect-icon {
    min-width: 30px;
  }
  .icon {
    color: inherit !important;
  }
  .net-effect {
    flex-grow: 0;
    flex-shrink: 0;
  }
  .effect-value {
    min-width: 60px;
    text-align: center;
  }
</style>
