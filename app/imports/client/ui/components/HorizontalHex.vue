<template lang="html">
  <div
    class="d-flex justify-center align-center"
    style="height: 120px; width: 120px;"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      style="height: 120px; width: 120px; position: absolute;"
    >
      <path
        d="M 251.313 23.844 L 49.438 140.25 L 49.062 373.75 L 251.687 490.156 L 453.563 373.75 L 453.938 140.25 L 251.313 23.844 Z"
        fill-opacity="1"
        :fill="hover ? 'rgb(255, 255, 255)' : 'rgb(255, 255, 255)'"
      />
      <path
        d="M 249.801 51.001 L 71.808 153.637 L 71.477 359.513 L 250.131 462.148 L 428.125 359.513 L 428.455 153.637 L 249.801 51.001 Z"
        fill-opacity="1"
        :fill="hover ? 'rgb(40, 40, 40)' : 'rgb(80, 80, 80)'"
      />
    </svg>
    <div
      v-ripple
      style="height: 100px; width: 100px; border-radius: 50%; z-index: 1; cursor: pointer;"
      class="d-flex justify-center align-center"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="js">
  export default {
    data(){return {
      hover: false,
    }},
  }
</script>

<style lang="css" scoped>
path {
  transition: fill 0.3s ease;
}
</style>
