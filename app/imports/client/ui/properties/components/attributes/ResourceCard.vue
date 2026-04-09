<template lang="html">
  <v-card
    class="resource-card"
    :class="hover ? 'elevation-8': ''"
    :color="model.color"
    :theme="model.color ? (isDark ? 'dark' : 'light') : undefined"
  >
    <resource-card-content
      :model="model"
      :hover="hover"
      @mouseover="hover = true"
      @mouseleave="hover = false"
      @click="$emit('click')"
      @change="e => $emit('change', e)"
    />
    <card-highlight :active="hover" />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
import ResourceCardContent from '/imports/client/ui/properties/components/attributes/ResourceCardContent.vue';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';

const props = defineProps<{
  model: Record<string, any>;
}>();

const context = inject('context', {});
const hover = ref(false);

const isDark = computed(() => {
  if (!props.model.color) return undefined;
  return isDarkColor(props.model.color);
});
</script>

<style lang="css">
.resource-card {
  transition: box-shadow .4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.resource-card > div {
  padding-top: 16px;
  padding-bottom: 16px;
}
</style>
