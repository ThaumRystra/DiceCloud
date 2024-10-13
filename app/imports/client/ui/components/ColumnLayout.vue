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
</script>

<style lang="css">
.column-layout {
  column-count: 12;
  column-fill: balance;
  column-gap: 8px;
  column-width: 240px;
  padding: 8px;
}

.column-layout.wide-columns {
  column-width: 320px;
}

.column-layout>*,
.column-layout>span>div {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 8px;
  width: 100%;
}
</style>
