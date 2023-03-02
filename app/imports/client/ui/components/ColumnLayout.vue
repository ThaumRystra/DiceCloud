<template
 
  functional
>
  <div
    class="column-layout"
    :class="wideColumns ? 'wide-columns' : ''"
  >
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    wideColumns: Boolean,
  },
};
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
  display: table;
  table-layout: fixed;
  width: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateX(0);
  -webkit-transform: translateX(0);
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  break-inside: avoid;
  padding: 4px;
}
</style>
