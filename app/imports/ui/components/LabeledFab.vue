<template>
  <v-btn
    fab
    small
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <v-icon>{{ icon }}</v-icon>
    <span id="label">
      {{ label }}
    </span>
  </v-btn>
</template>

<script>
  /*
   * Because speed dials only work well with v-btn's as children, this hacky
   * component creates a v-btn with a label.
   */
  export default {
    props: ['icon', 'label'],
  }
</script>

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
