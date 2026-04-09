<template lang="html">
  <div class="saving-throw-viewer">
    <v-row dense>
      <property-field
        name="DC"
        large
        center
        :calculation="model.dc"
      />
      <property-field
        name="Save"
        mono
        :value="model.stat"
      />
      <property-field
        v-if="model.target === 'self'"
        name="Target"
        value="Self"
      />
    </v-row>
  </div>
</template>

<script setup lang="ts">
defineProps<{ model: Record<string, any> }>();
</script>
