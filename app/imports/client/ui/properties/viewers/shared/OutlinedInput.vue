<script setup lang="ts">
import { inject } from 'vue';

const theme = inject<{ isDark: boolean }>('theme', { isDark: false });

withDefaults(defineProps<{
  name?: string;
}>(), {
  name: undefined,
});
</script>

<template>
  <fieldset
    :class="theme.isDark? 'v-theme--dark' :'v-theme--light'"
    class="outlined-input rounded v-sheet--outlined"
    @click="$emit('click', $event)"
    @dragover="$emit('dragover', $event)"
    @drop="$emit('drop', $event)"
    @dragleave="$emit('dragleave', $event)"
  >
    <legend
      v-if="name"
      class="text-caption px-1 ml-2 name"
      style="line-height: 0;"
    >
      {{ name }}
    </legend>
    <slot style="margin-top: -10px;" />
  </fieldset>
</template>

<style lang="css" scoped>
.outlined-input{
  transition: border-color .15s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.outlined-input.v-theme--light {
  border-color: rgba(0,0,0,.38);
}
.outlined-input.v-theme--dark {
  border-color: rgba(255,255,255,.24);
}
.outlined-input.v-theme--light:not(.no-hover):hover {
  border-color: rgba(0,0,0,.86);
}
.outlined-input.v-theme--dark:not(.no-hover):hover {
  border-color: #fff;
}
.outlined-input .name {
  color: rgba(0,0,0,.6);
}
.outlined-input.v-theme--dark .name {
  color: rgba(255,255,255,.7);
}
</style>
