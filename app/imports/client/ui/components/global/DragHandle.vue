<template>
  <v-icon
    class="handle"
    v-bind="$attrs"
    @click.native="e => { }"
    @touchstart.native.stop="e => { }"
    @touchend.native="portalEvent"
  >
    mdi-drag
  </v-icon>
</template>

<script lang="js">
import { defer } from 'lodash'

export default {
  methods: {
    portalEvent(e) {
      // Stop everything in the document listening for this touch event
      e.stopPropagation();
      // But also send it to straight to the root for draggable.js
      defer(() => {
        e.target.ownerDocument.dispatchEvent(e);
      });
    }
  }
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
