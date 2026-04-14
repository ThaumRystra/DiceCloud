<script setup lang="ts">
import { computed, useAttrs, inject } from 'vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import CoinValue from '/imports/client/ui/components/CoinValue.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';
import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities';

const props = defineProps<{
  model?: Record<string, any>;
  selected?: boolean;
  hideIcon?: boolean;
  preparingSpells?: boolean;
}>();

const context = inject('context', {} as any);
const attrs = useAttrs();

const hasClickListener = computed(() => !!(attrs as any).onClick);

const title = computed(() => {
  const model = props.model;
  if (!model) return undefined;
  if (model.quantity !== 1) {
    if (model.plural) return `${model.quantity} ${model.plural}`;
    if (model.name) return `${model.quantity} ${model.name}`;
  } else if (model.name) {
    return model.name;
  }
  const prop = (PROPERTIES as any)[model.type];
  return prop && prop.name;
});

const totalValue = computed(() =>
  stripFloatingPointOddities(props.model!.value * props.model!.quantity)
);

const totalWeight = computed(() =>
  stripFloatingPointOddities(props.model!.weight * props.model!.quantity)
);

const attunementText = computed(() => {
  if (props.model?.requiresAttunement) {
    if (props.model.attuned) return 'Attuned';
    return 'Requires attunement';
  }
  return undefined;
});
</script>

<template>
  <div class="item">
    <div class="d-flex justify-space-between">
      <div class="label">
        {{ title }}
        <template v-if="attunementText">
          ({{ attunementText }})
        </template>
      </div>
      <property-icon
        class="ml-2"
        color="rgba(0,0,0,0.7)"
        :model="model"
      />
    </div>

    <div
      v-if="model.value !== undefined || model.weight !== undefined"
      class="weight-value my-2 d-flex justify-space-between"
    >
      <div class="value ml-4">
        <div
          v-if="model.value !== undefined"
        >
          <div
            v-if="model.quantity > 1"
            class="d-flex align-center mb-2"
          >
            <v-icon
              class="mr-2"
              size="small"
            >
              $vuetify.icons.cash
            </v-icon>
            <coin-value
              :value="model.value * model.quantity"
            />
          </div>
          <div class="d-flex align-center">
            <v-icon
              class="mr-2"
              size="small"
            >
              $vuetify.icons.two_coins
            </v-icon>
            <coin-value
              class="mr-2"
              :value="model.value"
            />
            <span
              v-if="model.quantity > 1"
              class="ml-1"
            >
              each
            </span>
          </div>
        </div>
      </div>
  
      <div class="weight ml-4">
        <div
          v-if="model.weight !== undefined"
        >
          <div
            v-if="model.quantity > 1"
            class="d-flex align-center mb-2"
          >
            <v-icon
              class="mr-2"
              size="small"
            >
              $vuetify.icons.injustice
            </v-icon>
            {{ totalWeight }} lb
          </div>
          <div class="d-flex align-center">
            <v-icon
              class="mr-2"
              size="small"
            >
              $vuetify.icons.weight
            </v-icon>
            {{ model.weight }} lb
            <span
              v-if="model.quantity > 1"
              class="ml-1"
            >
              each
            </span>
          </div>
        </div>
      </div>
    </div>

    <property-description
      text
      :model="model.description"
    />
  </div>
</template>

<style lang="css" scoped>
.item-avatar {
  min-width: 32px;
}
.item .label {
  font-size: 14pt;
  font-variant: all-small-caps;
  font-weight: 600;
}
</style>
