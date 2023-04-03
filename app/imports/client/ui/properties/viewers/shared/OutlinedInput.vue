<template>
  <v-sheet
    outlined
    rounded
    style="position: relative;"
    @click="$emit('click', $event)"
  >
    <v-sheet
      v-if="name"
      class="text-caption px-1 ml-2 name"
      style="top: 0; left: 0; margin-top: -10px; position: absolute;"
    >
      {{ name }}
    </v-sheet>
    <slot />
  </v-sheet>
</template>

<script lang="js">
export default {
  props: {
    name: {
      type: String,
      default: undefined,
    }
  }
}
</script>