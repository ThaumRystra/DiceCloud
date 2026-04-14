<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';

const props = withDefaults(defineProps<{
  color?: string;
  transparentToolbar?: boolean;
}>(), {
  color: () => getThemeColor('secondary'),
});

const attrs = useAttrs();
const hovering = ref(false);

const isDark = computed(() => isDarkColor(props.color));
const hasClickListener = computed(() => !!attrs.onClick);
const hasToolbarClickListener = computed(() => !!attrs.onToolbarclick);

function hoverToolbar(val: boolean) {
  hovering.value = !!attrs.onToolbarclick && val;
}
</script>

<template lang="html">
  <v-card
    :hover="hasClickListener"
    class="toolbar-card"
    :class="{'transparent-toolbar': transparentToolbar, hovering}"
    :elevation="hovering ? 8 : undefined"
    @click="$emit('click')"
  >
    <v-toolbar
      flat
      :style="`transform: none; ${hasToolbarClickListener ? 'cursor: pointer;' : ''}`"
      :class="{}"
      :color="transparentToolbar ? undefined : color"
      :theme="transparentToolbar ? undefined : (isDark ? 'dark' : 'light')"
      @click="$emit('toolbarclick')"
      @mouseover="hoverToolbar(true)"
      @mouseleave="hoverToolbar(false)"
    >
      <slot name="toolbar" />
    </v-toolbar>
    <div>
      <slot />
    </div>
    <card-highlight :active="hovering" />
  </v-card>
</template>

<style lang="css">
.toolbar-card .v-toolbar__title {
  font-size: 15px;
}

.toolbar-card {
  transition: box-shadow .4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toolbar-card.transparent-toolbar .v-theme--dark.v-toolbar.v-sheet {
  background-color: #303030;
}
</style>
