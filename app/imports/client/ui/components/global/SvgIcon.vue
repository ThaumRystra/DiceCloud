<template lang="html">
  <i
    ref="icon"
    aria-hidden
    role="img"
    class="v-icon"
    :class="themeClasses"
    :style="color && `color: ${color}`"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      :style="`height: ${size}; width: ${size}`"
    >
      <path
        :d="shape"
      />
    </svg>
  </i>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';

const SIZE_MAP: Record<string, string> = {
  xSmall: '12px',
  small: '16px',
  default: '24px',
  medium: '28px',
  large: '36px',
  xLarge: '40px',
};

const theme = inject<{ isDark: boolean }>('theme', { isDark: false });

const props = defineProps<{
  shape?: string;
  color?: string;
  xSmall?: boolean;
  small?: boolean;
  medium?: boolean;
  large?: boolean;
  xLarge?: boolean;
}>();

const icon = ref<HTMLElement | null>(null);
const inheritedSize = ref<string | undefined>(undefined);

const isDark = computed(() => theme.isDark);

const themeClasses = computed(() => ({
  'v-theme--dark': isDark.value,
  'v-theme--light': !isDark.value,
}));

const size = computed(() => {
  if (inheritedSize.value) return inheritedSize.value;
  if (props.xSmall) return SIZE_MAP['xSmall'];
  if (props.small) return SIZE_MAP['small'];
  if (props.medium) return SIZE_MAP['medium'];
  if (props.large) return SIZE_MAP['large'];
  if (props.xLarge) return SIZE_MAP['xLarge'];
  return SIZE_MAP['default'];
});

onMounted(() => {
  inheritedSize.value = icon.value?.style.fontSize;
});
</script>

<style lang="css" scoped>
  svg {
    color: inherit;
    fill: currentColor;
  }
</style>
