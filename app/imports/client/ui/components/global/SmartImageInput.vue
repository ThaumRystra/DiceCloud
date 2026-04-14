<script setup lang="ts">
import { ref, computed, inject, useAttrs } from 'vue';
import { useStore } from 'vuex';
import { useSmartInput } from '/imports/client/ui/components/global/useSmartInput';
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';
import { key } from '/imports/client/ui/vuexStore';

defineOptions({ inheritAttrs: false });

const theme = inject<{ isDark: boolean }>('theme', { isDark: false });
const store = useStore(key);

const props = defineProps<{
  value?: string | number | Date | unknown[] | object | boolean;
  errorMessages?: string | string[];
  disabled?: boolean;
  debounce?: number;
  rules?: Array<(val: unknown) => string | true>;
  label?: string;
}>();

const emit = defineEmits<{
  change: [val: unknown, ack: (err?: unknown) => void];
  input: [val: unknown];
}>();

const attrs = useAttrs();
const { change } = useSmartInput(props, emit, attrs);

const id = ref(Random.id());
const dragging = ref(false);

const themeClasses = computed(() => ({
  'v-theme--dark': theme.isDark,
  'v-theme--light': !theme.isDark,
}));

function openImageInputDialog() {
  store.commit('pushDialogStack', {
    component: 'image-input-dialog',
    elementId: id.value,
    data: { href: props.value },
    callback: (href: string) => {
      if (href) {
        change(href);
      }
    },
  });
}

function handleDragOver(_event: DragEvent) {
  // TODO
}

function handleDragLeave() {
  // TODO
}

function handleDrop(_event: DragEvent) {
  // TODO
}

function uploadFile(_file: File) {
  // Implement your file upload logic here
}
</script>

<template>
  <outlined-input
    :name="label"
    class="smart-image-input mb-3"
    :data-id="id"
    :class="{ dragging }"
    @click="openImageInputDialog"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <template v-if="value">
      <img
        v-if="value"
        class="image"
        :src="value"
      >
      <div
        class="image-overlay"
        :class="themeClasses"
      />
      <v-btn
        v-if="value"
        icon
        dark
        class="clear-button ma-1"
        @click.stop="change(undefined)"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
    <div
      v-else
      class="add-image-text d-flex align-center justify-center"
    >
      Add image
      <v-icon end>
        mdi-image-outline
      </v-icon>
    </div>
  </outlined-input>
</template>

<style scoped>
.smart-image-input {
  position: relative;
  min-height: 120px;
  cursor: pointer;
  overflow: hidden;
}

.image {
  min-height: 100px;
  max-height: 300px;
  max-width: 100%;
  margin-bottom: -7px;
}

.clear-button {
  position: absolute;
  top: 0;
  right: 0;
}

.dragging {
  border-style: dashed;
}

.outlined-input.dragging.v-theme--dark:not(.no-hover) {
  border-color: #fff;
}

.outlined-input.dragging.v-theme--light:not(.no-hover) {
  border-color: rgba(0, 0, 0, .86);
}

.image-overlay {
  position: absolute;
  top: 0;
  height: 12px;
  left: 0;
  right: 0;
}

.image-overlay.v-theme--dark {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
}

.image-overlay.v-theme--light {
  background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
}

.add-image-text {
  opacity: 0.7;
  height: 118px;
}

.smart-image-input:hover .add-image-text {
  opacity: 1;
}
</style>

<style>
.smart-image-input > legend {
  position: relative;
  z-index: 1;
}

.smart-image-input .clear-button i {
  text-shadow: 0 0 4px #000, 0 0 4px #000;
}
</style>
