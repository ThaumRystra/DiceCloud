<template lang="html">
  <div class="point-buy-spend-form">
    <v-row
      v-if="model.values && model.values.length"
      dense
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
      dense
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
          dense
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
    <v-row
      dense
    >
      <v-col
        v-if="typeof model.spent === 'number'"
        cols="12"
        class="text-h4 mb-4 pr-8 d-flex justify-end"
        :class="{
          'error--text': model.spent > (model.total && model.total.value),
          'warning--text': model.spent < (model.total && model.total.value),
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

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import CalculationErrorList from '/imports/client/ui/properties/forms/shared/CalculationErrorList.vue';
import { resolveCalculationNode } from '/imports/api/engine/computation/computeComputation/computeByType/computeCalculation';
import { Tracker } from 'meteor/tracker'

export default {
  components: {
    CalculationErrorList,
  },
  mixins: [propertyFormMixin],
  data() {
    return {
      estimatedCost: undefined,
      useEstimate: false,
    };
  },
  methods: {
    max(row) {
      return row.max ? row.max && row.max.value : this.model.max && this.model.max.value;
    },
    min(row) {
      return row.min ? row.min && row.min.value : this.model.min && this.model.min.value;
    },
    async dragSlider(row, value) {
      const currentSpent = this.model.spent;
      let newSpent = currentSpent - row.spent;
      const costFunction = EJSON.clone(row.cost || this.model.cost);
      if (!costFunction?.parseNode) return;
      if (costFunction) costFunction.parseLevel = 'reduce';
      await resolveCalculationNode(costFunction, costFunction.parseNode, { value });
      if (Number.isFinite(costFunction.value)) {
        newSpent += costFunction.value;
        if (this.useEstimate) this.estimatedCost = newSpent;
      }
    },
    startSlider() {
      this.useEstimate = true;
    },
    endSlider() {
      this.useEstimate = false;
    },
    releaseSlider(i, value, ack) {
      const newAck = (error, result) => {
        Tracker.afterFlush(() => {
          this.estimatedCost = undefined;
        });
        ack?.(error, result);
      }
      this.$emit('change', {
        path: ['values', i, 'value'],
        value,
        ack: newAck
      });
    },
  },
};
</script>
