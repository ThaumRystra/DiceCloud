<template lang="html">
  <div class="feature-viewer">
    <v-row dense>
      <property-description
        name="Summary"
        :model="model.summary"
      />
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script setup lang="ts">
defineProps<{ model: Record<string, any> }>();
</script>

<style lang="css" scoped>

</style>
