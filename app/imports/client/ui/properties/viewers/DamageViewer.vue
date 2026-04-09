<template lang="html">
  <div class="damage-viewer">
    <v-row dense>
      <property-field
        name="Amount"
        large
        center
        :calculation="model.amount"
      />
      <property-field
        name="Type"
        :value="type"
      />
      <property-field
        v-if="model.target === 'self'"
        name="Target"
        value="Self"
      />
      <template v-if="model.save">
        <property-field
          name="DC"
          large
          center
          :calculation="model.save.dc"
        />
        <property-field
          name="Save"
          mono
          :value="model.save.stat"
        />
        <property-field
          name="On a successful saving throw"
          v-bind="saveDamage"
        />
      </template>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ model: Record<string, any> }>();

const type = computed(() => {
  if (props.model.damageType === 'healing') return props.model.damageType;
  return `${props.model.damageType} damage`;
});

const saveDamage = computed(() => {
  if (!props.model.save) return;
  if (!props.model.save.damageFunction?.calculation) {
    return { value: 'Half damage' };
  }
  if (props.model.save.damageFunction.calculation == '0' || props.model.save.damageFunction.value === 0) {
    return { value: 'No damage' };
  }
  return { calculation: props.model.save.damageFunction };
});
</script>

<style lang="css" scoped>

</style>
