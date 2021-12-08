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
      <property-description
        text
        :model="model.summary"
      />
    </v-card-text>
  </toolbar-card>
</template>

<script lang="js">
	import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
  import PropertyDescription from '/imports/ui/properties/viewers/shared/PropertyDescription.vue'

	export default {
		components: {
			ToolbarCard,
      PropertyDescription,
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
