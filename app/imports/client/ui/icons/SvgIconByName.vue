<template lang="html">
  <svg-icon
    :shape="shape"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SvgIcon from '/imports/client/ui/components/global/SvgIcon.vue';
import SVG_ICONS from '/imports/constants/SVG_ICONS';

const props = defineProps<{
  name: string;
}>();

const shape = computed(() => SVG_ICONS[props.name].shape);
</script>

<style lang="css" scoped>
</style>
