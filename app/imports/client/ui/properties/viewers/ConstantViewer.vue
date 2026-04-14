<script setup lang="ts">
defineProps<{ model: Record<string, any> }>();
</script>

<template lang="html">
  <div class="buff-viewer">
    <v-row dense>
      <property-field
        mono
        name="Variable name"
        :value="model.variableName"
      />
      <property-field
        name="Calculation"
        :value="model.calculation"
      />
    </v-row>
  </div>
</template>
