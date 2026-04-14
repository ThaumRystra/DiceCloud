<script setup lang="ts">
defineProps<{
  icon?: string;
  label?: string;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <v-btn
    icon
    size="small"
    v-bind="$attrs"
    :disabled="disabled"
    :style="disabled ? 'background-color: #616161 !important;' : ''"
    @click="$emit('click')"
  >
    <v-icon>{{ icon }}</v-icon>
    <span id="label">
      {{ label }}
    </span>
  </v-btn>
</template>

<style scoped>
  /*
   *  Remove all button formatting and replace it with label formatting
   */
  #label {
    left: initial;
    top: initial;
    bottom: initial;
    transform: initial;
    position: absolute;
    font-weight: initial;
    text-transform: initial;
    cursor: initial;
    opacity: initial;
    pointer-events: none;
    right: 56px;
    background-color: #616161;
    border-radius: 2px;
    padding: 5px 8px;
    color: white;
    overflow: hidden;
    white-space: nowrap;
    font-size: 12px;
    content: "meep";
  }
</style>
