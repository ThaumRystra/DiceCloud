<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  errors?: any[];
  calculations?: any[];
}>(), {
  errors: undefined,
  calculations: undefined,
});

const computedErrors = computed(() => {
  if (props.errors) {
    return props.errors;
  } else if (props.calculations) {
    const errors: any[] = [];
    props.calculations.forEach(calc => {
      if (calc.errors) errors.push(...calc.errors);
    });
    return errors;
  } else {
    return [];
  }
});

function errorIcon(type: string) {
  if (type === 'subsitution') {
    return 'mdi-information';
  } else if (type === 'evaluation') {
    return 'mdi-alert-circle';
  } else {
    return 'mdi-alert';
  }
}

function errorColor(type: string) {
  if (type === 'subsitution') {
    return 'info';
  } else if (type === 'evaluation') {
    return 'warning';
  } else {
    return 'error';
  }
}
</script>

<template lang="html">
  <div
    v-if="computedErrors.length"
    class="error-list"
  >
    <v-slide-x-transition
      group
      hide-on-leave
    >
      <v-alert
        v-for="error in computedErrors"
        :key="error.message"
        :value="true"
        :icon="errorIcon(error.type)"
        :color="errorColor(error.type)"
        class="mb-2"
        density="compact"
        variant="text"
      >
        <pre>{{ error.message }}</pre>
      </v-alert>
    </v-slide-x-transition>
  </div>
</template>

<style lang="css">
.error-list .v-alert__content{
  overflow-x: auto;
}
</style>
