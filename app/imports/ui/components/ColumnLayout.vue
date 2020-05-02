<template
  lang="html"
  functional
>
  <div class="column-layout">
    <slot />
  </div>
</template>

<script>
export default {
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
	.column-layout >>> > div {
		-webkit-backface-visibility: hidden;
		-webkit-transform: translateX(0);
		-webkit-column-break-inside: avoid;
		page-break-inside: avoid;
		break-inside: avoid;
		padding: 4px;
	}
</style>
