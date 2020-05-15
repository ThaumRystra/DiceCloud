<template lang="html">
  <toolbar-card
    :id="model._id"
    :color="model.color"
    @click="$emit('click')"
  >
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer />
    </template>
    <v-card-text v-if="model.summary">
      <computed
        embedded
        :value="model.summary"
      />
    </v-card-text>
  </toolbar-card>
</template>

<script>
	import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
  import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';

	export default {
		components: {
			ToolbarCard,
      Computed: ComputedForCreature,
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
