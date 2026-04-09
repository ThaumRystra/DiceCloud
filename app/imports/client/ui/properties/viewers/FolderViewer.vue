<template lang="html">
  <div class="folder-viewer">
    <v-row
      density="compact"
    >
      <property-field
        name="Name"
        :value="model.name"
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
