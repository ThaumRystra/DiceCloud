<script setup lang="ts">
import { computed } from 'vue';
import getEffectIcon from '/imports/client/ui/utility/getEffectIcon';

const props = defineProps<{ model: Record<string, any> }>();

const value = computed(() => {
  if (props.model.amount && 'value' in props.model.amount) {
    return props.model.amount.value;
  } else {
    return props.model.amount.calculation;
  }
});

const effectIcon = computed(() => {
  const effectOp = props.model.operation === 'increment' ? 'add' : 'base';
  let val = value.value;
  if (typeof val === 'string') {
    val = 1;
  }
  return getEffectIcon(effectOp, -val);
});

const displayedValue = computed(() => {
  if (
    typeof value.value === 'number' &&
    props.model.operation !== 'set'
  ) {
    return Math.abs(value.value);
  } else {
    return value.value;
  }
});
</script>

<template lang="html">
  <div class="adjustment-viewer">
    <v-row dense>
      <property-field
        name="Amount"
        center
        large
      >
        <v-icon class="mx-1">
          {{ effectIcon }}
        </v-icon>
        {{ displayedValue }}
      </property-field>
      <property-field
        name="Attribute"
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

<style lang="css" scoped>

</style>
