<template
  lang="html"
  functional
>
  <div
    class="column-layout"
    :class="wideColumns ? 'wide-columns' : ''"
  >
    <slot />
  </div>
</template>

<script lang="js">
export default {
  props: {
    wideColumns: Boolean,
  },
};

/*
Removed to improve chrome layout performance, put it back if there are rendering errors
.column-layout>span>div {
  display: table;
  table-layout: fixed;
}
*/
</script>

<style lang="css">
.column-layout {
  column-count: 12;
  column-fill: balance;
  column-gap: 0;
  column-width: 240px;
  transform: translateZ(0);
  padding: 4px;
}

.column-layout.wide-columns {
  column-count: 12;
  column-fill: balance;
  column-gap: 0;
  column-width: 320px;
  transform: translateZ(0);
  padding: 4px;
}

.column-layout>div,
.column-layout>span>div {
  width: 100%;
  backface-visibility: hidden;
  transform: translateX(0);
  page-break-inside: avoid;
  break-inside: avoid;
  padding: 4px;
}
</style>
