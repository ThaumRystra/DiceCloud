<script setup lang="ts">
import { ref, computed, inject, onBeforeUnmount } from 'vue';
import { debounce as lodashDebounce } from 'lodash';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

const props = defineProps<{
  disabled?: boolean;
  debounce?: number;
  singleClick?: boolean;
}>();

const emit = defineEmits(['click', 'clicks']);

const context = inject<any>('context', {});

const loading = ref(false);
const timesClicked = ref(0);

const isDisabled = computed(() => context.editPermission === false || props.disabled);

const debounceTime = computed(() => {
  if (Number.isFinite(props.debounce)) return props.debounce!;
  if (Number.isFinite(context.debounceTime)) return context.debounceTime;
  return 400;
});

function acknowledgeChange(error?: any) {
  loading.value = false;
  if (error) {
    console.error(error);
    snackbar({ text: error.reason || error.message || error.toString() });
  }
}

function clicks() {
  if (!debounceClicks.value) return;
  loading.value = true;
  emit('clicks', timesClicked.value, acknowledgeChange);
  timesClicked.value = 0;
}

const debounceClicks = computed(() => lodashDebounce(clicks, debounceTime.value));

function click() {
  if (props.singleClick) {
    loading.value = true;
  } else {
    timesClicked.value += 1;
    debounceClicks.value();
  }
  emit('click', acknowledgeChange);
}

onBeforeUnmount(() => {
  debounceClicks.value.flush();
});
</script>

<template lang="html">
  <v-btn 
    v-bind="$attrs"
    :disabled="isDisabled"
    :loading="loading"
    @click.stop.prevent="click"
  >
    <slot />
  </v-btn>
</template>
