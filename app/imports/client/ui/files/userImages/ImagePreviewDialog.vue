<template lang="html">
  <img
    class="preview-image v-sheet v-card elevation-6"
    :class="themeClasses"
    :src="href"
    @click="back"
  >
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useStore } from 'vuex';

defineProps<{
  href: string;
}>();

const theme = inject<{ isDark: boolean }>('theme', { isDark: false });
const store = useStore();

const themeClasses = computed(() => ({
  'v-theme--dark': theme.isDark,
  'v-theme--light': !theme.isDark,
}));

function back() {
  store.dispatch('popDialogStack');
}
</script>

<style lang="css" scoped>
.preview-image {
  max-height: 100%;
  max-width: 100%;
  cursor: zoom-out;
}
</style>
