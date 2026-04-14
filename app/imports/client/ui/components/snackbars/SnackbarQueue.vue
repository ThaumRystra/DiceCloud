<script setup lang="ts">
// Modified from https://gitlab.com/tozd/vue/snackbar-queue
import { ref, watch, watchEffect, onMounted } from 'vue';
import { globalState } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import LogContent from '/imports/client/ui/log/LogContent.vue';

const props = withDefaults(defineProps<{
  timeout?: number;
  pause?: number;
}>(), {
  timeout: 15000,
  pause: 300,
});

const isShown = ref(false);
const snackbar = ref<Record<string, any> | null>(null);

let handle: ReturnType<typeof setTimeout> | null = null;
let unwait: (() => void) | null = null;

watch(isShown, (newValue) => {
  if (newValue === false && snackbar.value) {
    const snackbarIndex = globalState.queue.findIndex((element) => element.id === snackbar.value?.id);
    if (snackbarIndex > -1) {
      globalState.queue.splice(snackbarIndex, 1);
    }
    snackbar.value = null;
  }
});

function clearSnackbarState() {
  if (handle) {
    clearTimeout(handle);
    handle = null;
  }
  if (unwait) {
    unwait();
    unwait = null;
  }
}

function showNextSnackbar() {
  clearSnackbarState();

  const stop = watchEffect(() => {
    const next = globalState.queue.find((element) => element.shown === false);
    if (!next) return;

    stop();
    unwait = null;

    next.shown = true;
    snackbar.value = next;
    isShown.value = true;

    handle = setTimeout(() => {
      handle = null;
      showNextSnackbar();
    }, props.timeout + props.pause);
  });
  unwait = stop;
}

function closeSnackbar() {
  clearSnackbarState();
  isShown.value = false;
  setTimeout(() => {
    showNextSnackbar();
  }, props.pause);
}

onMounted(() => {
  showNextSnackbar();
});
</script>

<template lang="html">
  <v-snackbar
    location="bottom start"
    color="accent"
    v-bind="$attrs"
    :model-value="isShown"
    :timeout="timeout"
    @update:model-value="value => isShown = value"
  >
    <div class="d-flex align-center">
      <template v-if="snackbar && snackbar.data">
        <div v-if="snackbar.data.text">
          {{ snackbar.data.text }}
        </div>
        <template v-else-if="snackbar.data.content">
          <log-content :model="snackbar.data.content" />
        </template>
        <v-spacer />
        <v-btn
          v-if="snackbar.data.callback"
          color="primary"
          variant="text"
          @click="closeSnackbar(); snackbar.data.callback()"
        >
          {{ snackbar.data.callbackName }}
        </v-btn>
      </template>
    </div>
    <template #actions="{ isActive }">
      <v-btn
        icon
        v-bind="isActive"
        @click="closeSnackbar"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>
