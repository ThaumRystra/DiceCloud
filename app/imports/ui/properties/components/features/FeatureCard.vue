<template lang="html">
  <toolbar-card
    :id="model._id"
    :color="model.color"
    @toolbarclick="$emit('click')"
  >
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer />
    </template>
    <v-card-text v-if="model.summary">
      <computed
        :string="model.summary"
        :calculations="model.summaryCalculations"
        :inactive="model.inactive"
      />
    </v-card-text>
  </toolbar-card>
</template>

<script lang="js">
	import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
  import EmbedInlineComputations from '/imports/ui/components/computation/EmbedInlineComputations.vue';

	export default {
		components: {
			ToolbarCard,
      Computed: EmbedInlineComputations,
		},
		props: {
			model: {
        type: Object,
        required: true,
      },
		},
	};
</script>

<style lang="css" scoped>
</style>
