<template lang="html">
  <div class="features">
    <column-layout wide-columns>
      <div
        v-for="feature in features"
        :key="feature._id"
      >
        <feature-card
          :model="feature"
          :data-id="feature._id"
          @click="featureClicked(feature)"
        />
      </div>
    </column-layout>
  </div>
</template>

<script>
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';
	import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
	import FeatureCard from '/imports/ui/properties/components/features/FeatureCard.vue';

	export default {
		components: {
			ColumnLayout,
			FeatureCard,
		},
		props: {
			creatureId: {
        type: String,
        required: true,
      },
		},
		meteor: {
			features(){
        return getActiveProperties({
          ancestorId: this.creatureId,
          filter: {
            type: 'feature',
          },
        });
			},
		},
		methods: {
			featureClicked({_id}){
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
