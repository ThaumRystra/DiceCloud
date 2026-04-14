<script setup lang="ts">
defineProps<{ model: Record<string, any> }>();
</script>

<template lang="html">
  <div class="folder-viewer">
    <v-row class="density">
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

<style lang="css" scoped>

</style>
