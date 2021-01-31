<template lang="html">
  <div class="adjustment-viewer layout row align-center">
    {{ model.amountResult }} {{ model.stat }} damage
  </div>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';

	export default {
		mixins: [propertyViewerMixin],
	}
</script>

<style lang="css" scoped>
</style>
