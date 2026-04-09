<template>
  <div
    class="d-flex flex-column"
    style="height: 100%;"
  >
    <slot
      name="replace-toolbar"
      :flat="!offsetTop"
    />
    <v-toolbar
      v-if="!$slots['replace-toolbar']"
      :color="computedColor"
      :theme="isDark ? 'dark' : 'light'"
      class="base-dialog-toolbar"
      :flat="!offsetTop"
    >
      <v-btn
        icon
        @click="back"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <slot name="toolbar" />
      <template #extension>
        <slot name="toolbar-extension" />
      </template>
    </v-toolbar>
    <div
      v-if="$slots['unwrapped-content']"
      id="base-dialog-body"
      class="unwrapped-content"
      @scroll.passive="onScroll"
    >
      <slot name="unwrapped-content" />
    </div>
    <v-card-text
      v-else
      id="base-dialog-body"
      :class="{'dark-body': darkBody}"
      @scroll.passive="onScroll"
    >
      <slot />
    </v-card-text>
    <v-card-actions v-if="$slots.actions">
      <slot name="actions" />
    </v-card-actions>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';

const store = useStore();

const props = defineProps<{
  color?: string;
  overrideBackButton?: () => void;
  darkBody?: boolean;
}>();

const offsetTop = ref(0);

const computedColor = computed(() => props.color || getThemeColor('secondary'));
const isDark = computed(() => isDarkColor(computedColor.value));

function onScroll(e: Event) {
  offsetTop.value = (e.target as HTMLElement).scrollTop;
}

function back() {
  if (props.overrideBackButton) {
    props.overrideBackButton();
  } else {
    close();
  }
}

function close() {
  store.dispatch('popDialogStack');
}
</script>

<style scoped>
.base-dialog-toolbar {
  z-index: 2;
  border-radius: 2px 2px 0 0;
}

#base-dialog-body,
.unwrapped-content {
  flex-grow: 1;
  overflow: auto;
}

#base-dialog-body.dark-body {
  background-color: #fafafa;
}

.v-theme--dark #base-dialog-body.dark-body {
  background-color: #303030;
}
</style>
