<script setup lang="ts">
import { computed, useAttrs, inject } from 'vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import CoinValue from '/imports/client/ui/components/CoinValue.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';

const props = defineProps<{
  model?: Record<string, any>;
  selected?: boolean;
  hideIcon?: boolean;
  preparingSpells?: boolean;
}>();

const context = inject('context', {} as any);
const attrs = useAttrs();

const hasClickListener = computed(() => !!(attrs as any).onClick);
</script>

<template>
  <div class="inventory-container">
    <div class="d-flex justify-center">
      <property-icon
        class="ml-2"
        color="rgba(0,0,0,0.7)"
        :model="model"
      />
      <div class="label">
        {{ model.name }}
      </div>
    </div>

    <div
      v-if="model.value !== undefined || model.weight !== undefined"
      class="weight-value my-2 d-flex justify-space-between"
    >
      <div class="value ml-4">
        <div
          v-if="model.value !== undefined"
        >
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
          </div>

          <div class="d-flex align-center mb-2">
            <v-icon
              class="mr-2"
              size="small"
            >
              $vuetify.icons.cash
            </v-icon>
            <coin-value
              :value="model.contentsValue"
            />
            <span
              class="ml-1"
            >
              contents
            </span>
          </div>
        </div>
      </div>
  
      <div class="weight ml-4">
        <div
          v-if="model.weight !== undefined"
        >
          <div class="d-flex align-center">
            <v-icon
              class="mr-2"
              size="small"
            >
              $vuetify.icons.weight
            </v-icon>
            {{ model.weight }} lb
          </div>

          <div class="d-flex align-center mb-2">
            <v-icon
              class="mr-2"
              size="small"
            >
              $vuetify.icons.injustice
            </v-icon>
            {{ model.contentsWeight }} lb
            <span
              class="ml-1"
            >
              contents
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.item-avatar {
  min-width: 32px;
}
</style>
