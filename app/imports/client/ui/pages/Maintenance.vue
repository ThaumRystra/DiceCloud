<script setup lang="ts">
import MAINTENANCE_MODE from '/imports/constants/MAINTENANCE_MODE';

const maintenanceMode = MAINTENANCE_MODE;
</script>

<template>
  <div
    style="height: 100%;"
    class="d-flex flex-column align-center justify-center"
  >
    <h1
      v-if="maintenanceMode"
      class="ma-4 text-h3"
    >
      DiceCloud is currently under maintenance
    </h1>
    <template v-else>
      <h1
        class="ma-4 text-h3"
      >
        DiceCloud is live.
      </h1>
      <v-btn
        color="accent"
        to="/"
      >
        Home
      </v-btn>
    </template>
    <h1
      v-if="maintenanceMode && maintenanceMode.reason"
      class="ma-4 text-h4"
    >
      {{ maintenanceMode.reason }}
    </h1>
  </div>
</template>
