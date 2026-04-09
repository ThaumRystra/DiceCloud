<template>
  <v-icon
    class="handle"
    v-bind="$attrs"
    @click="e => { }"
    @touchstart.stop="e => { }"
    @touchend="portalEvent"
  >
    mdi-drag
  </v-icon>
</template>

<script setup lang="ts">
import { defer } from 'lodash';

function portalEvent(e: TouchEvent) {
  // Stop everything in the document listening for this touch event
  e.stopPropagation();
  // But also send it to straight to the root for draggable.js
  defer(() => {
    (e.target as Element)?.ownerDocument?.dispatchEvent(e);
  });
}
</script>

<style scoped>
.handle {
  cursor: move !important;
  cursor: -webkit-grab !important;
}
.handle::after {
  opacity: 0 !important;
}
</style>

<style>
.sortable-drag.handle {
  cursor: move !important;
  cursor: -webkit-grabbing !important;
}
</style>
