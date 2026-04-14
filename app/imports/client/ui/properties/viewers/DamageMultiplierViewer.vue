<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ model: Record<string, any> }>();

const operation = computed(() => {
  switch (props.model.value) {
    case 0: return 'Immunity';
    case 0.5: return 'Resistance';
    case 2: return 'Vulnerability';
    default: return '';
  }
});
</script>

<template lang="html">
  <div>
    <v-row dense>
      <property-field
        name="Value"
        :value="operation"
      />
      <property-field
        name="Damage types"
        wrap
      >
        <v-chip
          v-for="(damageType, index) in model.damageTypes"
          :key="index"
          class="mt-1 mr-1"
          :model-value="true"
          variant="outlined"
          size="small"
          label
        >
          {{ damageType }}
        </v-chip>
      </property-field>
      <property-field
        v-if="model.includeTags && model.includeTags.length"
        name="Damage tags required"
        wrap
      >
        <v-chip
          v-for="(damageType, index) in model.includeTags"
          :key="index"
          class="mt-1 mr-1"
          :model-value="true"
          size="small"
          variant="outlined"
        >
          {{ damageType }}
        </v-chip>
      </property-field>
      <property-field
        v-if="model.excludeTags && model.excludeTags.length"
        name="Damage tags excluded"
        wrap
      >
        <v-chip
          v-for="(damageType, index) in model.excludeTags"
          :key="index"
          class="mt-1 mr-1"
          :model-value="true"
          size="small"
          variant="outlined"
        >
          {{ damageType }}
        </v-chip>
      </property-field>
    </v-row>
  </div>
</template>

<style lang="css" scoped>

</style>
