<template>
  <v-layout
    style="height: 100%;"
    column
    align-center
    justify-center
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
  </v-layout>
</template>

<script lang="js">
  import MAINTENANCE_MODE from '/imports/constants/MAINTENANCE_MODE';
  export default {
    data(){return {
      maintenanceMode: MAINTENANCE_MODE,
    }},
  }
</script>
