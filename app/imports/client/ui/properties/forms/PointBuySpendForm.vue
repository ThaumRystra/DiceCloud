<script setup lang="ts">
import { ref } from 'vue';
import { resolveCalculationNode } from '/imports/api/engine/computation/computeComputation/computeByType/computeCalculation';
import { Tracker } from 'meteor/tracker';

const props = withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), {
  errors: () => ({}),
});

const emit = defineEmits(['change']);

const estimatedCost = ref<number | undefined>(undefined);
const useEstimate = ref(false);

function max(row: any) {
  return row.max ? row.max && row.max.value : props.model.max && props.model.max.value;
}

function min(row: any) {
  return row.min ? row.min && row.min.value : props.model.min && props.model.min.value;
}

async function dragSlider(row: any, value: any) {
  const currentSpent = props.model.spent;
  let newSpent = currentSpent - row.spent;
  const costFunction = EJSON.clone(row.cost || props.model.cost);
  if (!costFunction?.parseNode) return;
  if (costFunction) costFunction.parseLevel = 'reduce';
  await resolveCalculationNode(costFunction, costFunction.parseNode, { value });
  if (Number.isFinite(costFunction.value)) {
    newSpent += costFunction.value;
    if (useEstimate.value) estimatedCost.value = newSpent;
  }
}

function startSlider() {
  useEstimate.value = true;
}

function endSlider() {
  useEstimate.value = false;
}

function releaseSlider(i: number, value: any, ack?: Function) {
  const newAck = (error: any, result: any) => {
    Tracker.afterFlush(() => {
      estimatedCost.value = undefined;
    });
    ack?.(error, result);
  };
  emit('change', {
    path: ['values', i, 'value'],
    value,
    ack: newAck,
  });
}
</script>

<template lang="html">
  <div class="point-buy-spend-form">
    <v-row
      v-if="model.values && model.values.length"
      class="density"
    >
      <v-col
        cols="10"
        md="11"
      />
      <v-col
        cols="2"
        md="1"
        class="text-truncate d-flex justify-center"
      >
        Cost
      </v-col>
    </v-row>
    <v-row
      v-for="(row, i) in model.values"
      :key="row._id"
      class="density"
      align="center"
    >
      <v-col
        cols="12"
        md="2"
        class="d-flex justify-md-end"
      >
        {{ row.name }}
      </v-col>
      <v-col
        cols="2"
        md="1"
        class="d-flex justify-md-center justify-end"
      >
        {{ row.value }}
      </v-col>
      <v-col
        cols="8"
      >
        <smart-slider
          thumb-label
          density="compact"
          :ticks="max(row) - min(row) <= 20"
          :min="min(row)"
          :max="max(row)"
          :value="row.value"
          :error-messages="errors.values && errors.values[i] && errors.values[i].value"
          @change="(value, ack) => releaseSlider(i, value, ack)"
          @input="value => dragSlider(row, value)"
          @end="endSlider"
          @start="startSlider"
        />
      </v-col>
      <v-col
        cols="2"
        md="1"
        class="text-truncate d-flex justify-center"
      >
        {{ row.spent }}
      </v-col>
      <v-col
        v-if="row.errors && row.errors.length"
        cols="12"
      >
        <calculation-error-list
          :errors="row.errors"
        />
      </v-col>
    </v-row>
    <v-row class="density">
      <v-col
        v-if="typeof model.spent === 'number'"
        cols="12"
        class="text-h4 mb-4 pr-8 d-flex justify-end"
        :class="{
          'text-error': model.spent > (model.total && model.total.value),
          'text-warning': model.spent < (model.total && model.total.value),
        }"
      >
        {{ estimatedCost !== undefined ? estimatedCost : model.spent }}
        <template v-if="model.total && (typeof model.total.value === 'number')">
          / {{ model.total && model.total.value }}
        </template>
      </v-col>
    </v-row>
  </div>
</template>
