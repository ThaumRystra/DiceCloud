<script setup lang="ts">
import { computed } from 'vue';
import { autorun } from 'vue-meteor-tracker';

const { result: meteorStatus } = autorun(() => Meteor.status());

const status = computed(() => meteorStatus.value?.status);
const connected = computed(() => meteorStatus.value?.connected);

const icon = computed(() => {
  switch (status.value) {
    case 'connecting': return 'mdi-connection';
    case 'offline': return 'mdi-close-outline';
    case 'waiting': return 'mdi-timer-sand-empty';
    case 'failed': return 'mdi-alert-circle';
    default: return 'mdi-close-outline';
  }
});

const color = computed(() => {
  switch (status.value) {
    case 'connecting': return 'warning';
    case 'offline': return 'error';
    case 'waiting': return 'error';
    case 'failed': return 'error';
    default: return 'info';
  }
});
</script>

<template>
  <v-banner
    v-if="!connected"
    sticky
    lines="one"
    :icon="icon"
    :color="color"
    style="top: 96px;"
  >
    {{ status }}
  </v-banner>
</template>
