<template>
  <v-layout row align-center justify-end>
    <v-btn fab small>
      <v-icon>
        {{icon}}
      </v-icon>
    </v-btn>
    <div class="label pa-2">
      {{label}}
    </div>
  </v-layout>
</template>

<style scoped>
  .label {
    background-color: #424242;
    color: white;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
