<template lang="html">
  <div class="damage-viewer layout row align-center">
    {{ model.amountResult }}
    {{ model.damageType }}<span
      v-if="model.damageType !== 'healing'"
    >&nbsp;damage</span>
  </div>
</template>

<script lang="js">
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';

	export default {
		mixins: [propertyViewerMixin],
	}
</script>

<style lang="css" scoped>
</style>
