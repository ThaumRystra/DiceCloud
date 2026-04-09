<template lang="html">
  <div class="class-level-viewer">
    <v-row
      density="compact"
      justify="center"
    >
      <property-field
        name="Level"
        large
        center
        :value="model.level"
      />
      <property-field
        name="Variable Name"
        mono
        :value="model.variableName"
      />
      <property-field
        v-if="!context.creatureId"
        name="Condition"
        mono
        :value="model.slotFillerCondition"
      />
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

defineProps<{ model: Record<string, any> }>();
const context = inject<any>('context', {});
</script>

<style lang="css" scoped>

</style>
