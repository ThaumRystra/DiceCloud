<template lang="html">
  <div class="point-buy-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          ref="focusFirst"
          label="Table name"
          :value="model.name"
          :error-messages="errors.name"
          @change="change('name', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="Min"
          hint="The minimum value for each row"
          :model="model.min"
          :error-messages="errors.min"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['min', ...path], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="Max"
          hint="The maximum value for each row"
          :model="model.max"
          :error-messages="errors.max"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['max', ...path], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="Cost"
          hint="A function of `value` that determines the cost of each row"
          hide-value
          :model="model.cost"
          :error-messages="errors.cost"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['cost', ...path], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <computed-field
          label="Total available points"
          hint="The total allowed cost of all rows"
          :model="model.total"
          :error-messages="errors.total"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['total', ...path], value, ack})"
        />
      </v-col>
    </v-row>
    <v-subheader>
      Rows
    </v-subheader>
    <v-slide-x-transition
      group
      leave-absolute
    >
      <v-row
        v-for="(row, i) in model.values"
        :key="row._id"
        dense
      >
        <v-divider
          v-if="i"
          style="flex-basis: 100%;"
          class="mb-6"
        />
        <v-col cols="11">
          <v-row dense>
            <v-col
              cols="12"
              md="6"
            >
              <text-field
                ref="focusFirst"
                label="Row Name"
                :value="row.name"
                :error-messages="errors.values && errors.values[i] && errors.values[i].name"
                @change="change(['values', i, 'name'], ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <text-field
                label="Variable name"
                :value="row.variableName"
                hint="Use this name in calculations to reference this row of the table"
                :error-messages="errors.values && errors.values[i] && errors.values[i].variableName"
                @change="change(['values', i, 'variableName'], ...arguments)"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <text-field
                label="Value"
                type="number"
                :min="row.hasOwnProperty('min') ? row.min && row.min.value : model.min && model.min.value"
                :max="row.hasOwnProperty('max') ? row.max && row.max.value : model.max && model.max.value"
                :value="row.value"
                :error-messages="errors.values && errors.values[i] && errors.values[i].value"
                @change="(value, ack) => $emit('change', {path: ['values', i, 'value'], value, ack})"
              >
                <template v-if="row.spent">
                  Cost: {{ row.spent }}
                </template>
              </text-field>
            </v-col>
          </v-row>
        </v-col>
        <v-col
          cols="1"
          class="d-flex align-center justify-center"
        >
          <v-btn
            icon
            large
            @click="$emit('pull', {path: ['values', i]})"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row
        key="addButton"
        dense
        justify="end"
        class="mb-4"
      >
        <v-col
          cols="1"
          class="d-flex justify-center"
        >  
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
        </v-col>
      </v-row>
    </v-slide-x-transition>
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
