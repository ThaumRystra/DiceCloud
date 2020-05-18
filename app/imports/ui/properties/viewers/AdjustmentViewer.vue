<template lang="html">
  <div class="adjustment-viewer layout row align-center">
    <computed
      class="mr-2"
      :value="model.amount"
      :expect-number="false"
    /> {{ model.stat }} damage
  </div>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
  import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';

	export default {
    components: {
      Computed: ComputedForCreature,
    },
		mixins: [propertyViewerMixin],
	}
</script>

<style lang="css" scoped>
</style>
