<template lang="html">
  <computed
    class="property-description"
    embedded
    :value="value"
  />
</template>

<script>
import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';

export default {
	components: {
    Computed: ComputedForCreature,
	},
	props: {
		value: String,
	},
}
</script>
