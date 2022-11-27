<template>
  <div
    class="d-flex character-sheet-initiative"
    :style="{
      left: `${$vuetify.application.left}px`,
      right: `${$vuetify.application.right}px`,
      bottom: $vuetify.breakpoint.xsOnly ? '60px' : '4px',
    }"
  >
    <v-card
      v-for="c in [1,2,3,4,5]"
      :key="c"
      :width="48"
      :height="64"
      class="mx-1"
    >
      <v-progress-linear :value="62" />
      <v-img src="https://picsum.photos/200/300" />
    </v-card>
  </div>
</template>

<script lang="js">

export default {
  
}
</script>

<style scoped>
.character-sheet-initiative {
  position: fixed;
  bottom: 0;
  padding-right: 56px; 
  z-index: 5;
  overflow-x: auto;
  overflow-y: hidden;
  transition: .2s cubic-bezier(0.4, 0, 0.2, 1) transform,
    .2s cubic-bezier(0.4, 0, 0.2, 1) background-color,
    .2s cubic-bezier(0.4, 0, 0.2, 1) left,
    .2s cubic-bezier(0.4, 0, 0.2, 1) right,
    280ms cubic-bezier(0.4, 0, 0.2, 1) box-shadow,
    .25s cubic-bezier(0.4, 0, 0.2, 1) max-width,
    .25s cubic-bezier(0.4, 0, 0.2, 1) width;
}
</style>