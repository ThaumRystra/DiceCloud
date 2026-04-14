<script setup lang="ts">
import { computed } from 'vue';
import getProficiencyIcon from '/imports/client/ui/utility/getProficiencyIcon';

const props = withDefaults(defineProps<{
  value?: number;
}>(), {
  value: undefined,
});

const displayedIcon = computed(() => getProficiencyIcon(props.value));
</script>

<template lang="html">
  <v-icon v-if="value !== undefined">
    {{ displayedIcon }}
  </v-icon>
</template>
