<template lang="html">
  <div class="roll-viewer">
    <v-row dense>
      <property-field
        name="Variable Name"
        mono
        :value="model.variableName"
      />
      <property-field
        name="Roll"
        large
        center
        :calculation="model.roll"
      />
    </v-row>
  </div>
</template>

<script setup lang="ts">
defineProps<{ model: Record<string, any> }>();
</script>
