<template lang="html">
  <computed
    v-if="string"
    class="property-description"
    :string="string"
    :calculations="calculations"
  />
</template>

<script>
import EmbedInlineComputations from '/imports/ui/components/computation/EmbedInlineComputations.vue';

export default {
	components: {
    Computed: EmbedInlineComputations,
	},
	props: {
		string: {
      type: String,
      default: '',
    },
    calculations: {
      type: Array,
      default(){
        return [];
      },
    },
	},
}
</script>
