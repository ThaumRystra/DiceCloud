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

<script>
export default {
  props: {
    wideColumns: Boolean,
  },
};
</script>

<style lang="css" scoped>
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
	.column-layout >>> > div {
    /*
      Table and width set because firefox does not support break-inside: avoid
    */
    display: table;
    table-layout: fixed;
    width: 100%;
		-webkit-backface-visibility: hidden;
		-webkit-transform: translateX(0);
		-webkit-column-break-inside: avoid;
		page-break-inside: avoid;
		break-inside: avoid;
		padding: 4px;
	}
</style>
