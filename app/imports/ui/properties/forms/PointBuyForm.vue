<template lang="html">
  <div class="point-buy-form">
    <v-row dense>
      <text-field
        ref="focusFirst"
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <text-field
        label="Variable name"
        :value="model.variableName"
        hint="Use this name in calculations to reference this point buy table"
        :error-messages="errors.variableName"
        @change="change('variableName', ...arguments)"
      />
      <computed-field
        label="Min"
        hint="The minimum value for each row"
        :model="model.min"
        :error-messages="errors.min"
        @change="change('min', ...arguments)"
      />
      <computed-field
        label="Max"
        hint="The maximum value for each row"
        :model="model.max"
        :error-messages="errors.max"
        @change="change('max', ...arguments)"
      />
      <computed-field
        label="Cost"
        hint="A function of `value` that determines the cost of each row"
        :model="model.cost"
        :error-messages="errors.cost"
        @change="change('cost', ...arguments)"
      />
      <computed-field
        label="Total"
        hint="The total allowed cost of all rows"
        :model="model.total"
        :error-messages="errors.total"
        @change="change('total', ...arguments)"
      />
    </v-row>
    <v-row
      v-for="(row, i) in model.values"
      :key="row._id"
      dense
    >
      <text-field
        ref="focusFirst"
        label="Name"
        :value="model.name"
        :error-messages="errors.name"
        @change="change(['values', i, 'name'], ...arguments)"
      />
      <text-field
        label="Variable name"
        :value="model.variableName"
        hint="Use this name to reference this row of the table: tableVariableName.thisVariableName"
        :error-messages="errors.variableName"
        @change="change(['values', i, 'variableName'], ...arguments)"
      />
      <v-btn
        icon
        @click="$emit('pull', {path: ['values', i]})"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-row>
    <v-btn
      icon
      outlined
      :loading="addRowLoading"
      :disabled="rowsFull"
      @click="addRow"
    >
      <v-icon>
        mdi-plus
      </v-icon>
    </v-btn>
    <form-section
      v-if="$slots.children"
      name="Children"
      standalone
    >
      <slot name="children" />
    </form-section>
  </div>
</template>

<script lang="js">
import attributeListMixin from '/imports/ui/properties/forms/shared/lists/attributeListMixin.js';
import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
import { PointBuySchema } from '/imports/api/properties/PointBuys.js';

export default {
  mixins: [propertyFormMixin, attributeListMixin],
  data() {
    return {
      addRowLoading: false,
    };
  },
  computed: {
    rowsFull(){
      if (!this.model.values) return false;
      let maxCount = PointBuySchema.get('values', 'maxCount');
      return this.model.values.length >= maxCount;
    },
  },
  methods: {
    acknowledgeAddResult(){
      this.addRowLoading = false;
    },
    addRow(){
      this.addRowLoading = true;
      this.$emit('push', {
        path: ['values'],
        value: {
          _id: Random.id(),
        },
        ack: this.acknowledgeAddResult,
      });
    },
  },
}
</script>
