<script setup lang="ts">
defineProps<{ model: Record<string, any> }>();
</script>

<template lang="html">
  <div class="creature-viewer">
    <v-row dense>
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>
