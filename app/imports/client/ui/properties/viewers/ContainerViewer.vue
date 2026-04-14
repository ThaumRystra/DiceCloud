<script setup lang="ts">
import CoinValue from '/imports/client/ui/components/CoinValue.vue';

defineProps<{ model: Record<string, any> }>();
</script>

<template lang="html">
  <div class="container-viewer">
    <v-row dense>
      <property-field
        name="Value"
        :cols="{cols: 12, md: 6}"
      >
        <div style="overflow: hidden;">
          <div
            v-if="model.value !== undefined"
            class="d-flex align-center mb-2"
          >
            <v-icon
              class="mr-2"
              size="large"
            >
              $vuetify.icons.two_coins
            </v-icon>
            <coin-value
              class="text-subtitle-1 mr-2"
              :value="model.value"
            />
          </div>
          <div class="d-flex align-center">
            <v-icon
              class="mr-2"
              size="large"
            >
              $vuetify.icons.cash
            </v-icon>
            <coin-value
              class="text-subtitle-1 mr-2"
              :value="model.contentsValue"
            />
            <span class="text-subtitle-1">
              contents
            </span>
          </div>
        </div>
      </property-field>
      <property-field
        name="Weight"
        :cols="{cols: 12, md: 6}"
      >
        <div style="overflow: hidden;">
          <div
            v-if="model.weight !== undefined"
            class="d-flex align-center mb-2"
          >
            <v-icon
              class="mr-2"
              size="large"
            >
              $vuetify.icons.weight
            </v-icon>
            <span class="text-subtitle-1 mr-2">
              {{ model.weight }} lb
            </span>
          </div>
          <div
            class="d-flex align-center"
            :class="{'mb-2': model.contentsWeightless}"
          >
            <v-icon
              class="mr-2"
              size="large"
            >
              $vuetify.icons.injustice
            </v-icon>
            <span class="text-subtitle-1 mr-2">
              {{ model.contentsWeight }} lb
            </span>
            <span class="text-subtitle-1">
              contents
            </span>
          </div>
        </div>
      </property-field>
      <property-field
        v-if="model.carried"
        value="Carried"
      />
      <property-field v-if="model.contentsWeightless">
        <v-icon
          style="overflow: hidden;"
          class="ma-1"
        >
          $vuetify.icons.weightless
        </v-icon>
        <span class="ml-1">Contents weightless</span>
      </property-field>
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<style lang="css" scoped>

</style>
