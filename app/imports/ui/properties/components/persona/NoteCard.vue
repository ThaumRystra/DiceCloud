<template lang="html">
  <v-card
    :color="model.color"
    :data-id="model._id"
    hover
    :dark="model.color && isDark"
    :light="model.color && !isDark"
    @click="clickProperty(model._id)"
  >
    <v-card-title class="title">
      {{ model.name }}
    </v-card-title>
    <v-card-text>
      <property-description :value="model.description" />
    </v-card-text>
  </v-card>
</template>

<script>
import PropertyDescription from '/imports/ui/properties/viewers/shared/PropertyDescription.vue';
import isDarkColor from '/imports/ui/utility/isDarkColor.js';

export default {
	components: {
		PropertyDescription,
	},
	props: {
		model: Object,
	},
  computed: {
    isDark(){
      return isDarkColor(this.model.color);
    },
  },
	methods: {
		clickProperty(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `${_id}`,
				data: {_id},
			});
		},
	},
};
</script>

<style lang="css" scoped>
</style>
