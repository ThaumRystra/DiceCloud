<template lang="html">
  <div class="point-buy-viewer">
    <v-row dense>
      <property-field
        v-for="(row, i) in model.values"
        :key="row._id"
        :name="row.name"
        :value="row.value"
      />
    </v-row>
  </div>
</template>

<script setup lang="ts">
defineProps<{ model: Record<string, any> }>();
</script>
