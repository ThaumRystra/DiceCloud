<template lang="html">
  <div class="damage-viewer layout row align-center">
    <computed
      class="mr-2"
      :value="model.amount"
      :expect-number="false"
    />
    {{ model.damageType }}
    <span v-if="model.damageType !== 'healing'">
      &nbsp;damage
    </span>
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
