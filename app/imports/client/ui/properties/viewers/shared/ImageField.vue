<template lang="html">
  <v-col
    class="mb-3"
    v-bind="cols"
  >
    <fieldset
      :class="theme.isDark ? 'v-theme--dark' : 'v-theme--light'"
      class="d-flex rounded v-sheet--outlined pt-4 layout column align-center justify-center fill-height"
      style="overflow: hidden"
      @click="$emit('click', $event)"
    >
      <legend
        v-if="name"
        class="text-caption px-1 name"
        style="line-height: 0;"
      >
        {{ name }}
      </legend>

      <img
        :src="href"
        class="image"
        :data-id="`image-${href}`"
        @click="previewImage"
      >
    </fieldset>
  </v-col>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useStore } from 'vuex';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);
const theme = inject<{ isDark: boolean }>('theme', { isDark: false });

const props = withDefaults(defineProps<{
  name?: string;
  href?: string;
  aspectRatio?: number;
  cols?: Record<string, number>;
}>(), {
  name: undefined,
  href: undefined,
  aspectRatio: 1,
  cols: () => ({ cols: 12, sm: 6, md: 4 }),
});

function previewImage() {
  store.commit('pushDialogStack', {
    component: 'image-preview-dialog',
    elementId: `image-${props.href}`,
    data: {
      href: props.href,
      aspectRatio: props.aspectRatio,
    },
  });
}
</script>

<style lang="css" scoped>
.image {
  cursor: zoom-in;
  cursor: -webkit-zoom-in;
  cursor: -moz-zoom-in;
  max-height: 400px;
  max-width: 100%;
}
</style>
