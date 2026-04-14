<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { PointBuySchema } from '/imports/api/properties/PointBuys';
import PointBuySpendForm from '/imports/client/ui/properties/forms/PointBuySpendForm.vue';

const props = withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), {
  errors: () => ({}),
});

const emit = defineEmits(['change', 'push']);

const context = inject<any>('context', {});

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}

const addRowLoading = ref(false);

const rowsFull = computed(() => {
  if (!props.model.values) return false;
  const maxCount = PointBuySchema.get('values', 'maxCount');
  return props.model.values.length >= maxCount;
});

function addRow() {
  addRowLoading.value = true;
  emit('push', {
    path: ['values'],
    value: {
      _id: Random.id(),
    },
    ack() {
      addRowLoading.value = false;
    },
  });
}
</script>

<template lang="html">
  <div class="point-buy-form">
    <point-buy-spend-form 
      v-if="!context.isLibraryForm"
      :model="model"
      @change="e => $emit('change', e)"
    />
    <form-sections type="pointBuy">
      <form-section name="Point buy settings">
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <computed-field
              label="Min"
              hint="The minimum value for each row"
              placeholder="0"
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
              placeholder="100"
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
              label="Cost function"
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
      </form-section>
      <form-section name="Rows">
        <v-slide-x-transition
          group
          leave-absolute
        >
          <v-row
            v-for="(row, i) in model.values"
            :key="row._id"
            class="density"
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
                  v-if="context.isLibraryForm"
                  cols="12"
                  md="6"
                >
                  <text-field
                    label="Default value"
                    :value="row.value"
                    hint="The starting value of the row"
                    :error-messages="errors.values && errors.values[i] && errors.values[i].value"
                    @change="change(['values', i, 'value'], ...arguments)"
                  />
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
            </v-col>
            <v-col
              cols="1"
              class="d-flex align-center justify-center"
            >
              <v-btn
                icon
                size="large"
                @click="$emit('pull', {path: ['values', i]})"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row
            key="addButton"
            justify="end"
            class="mb-4 density"
          >
            <v-col
              cols="1"
              class="d-flex justify-center"
            >  
              <v-btn
                icon
                variant="outlined"
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
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>
