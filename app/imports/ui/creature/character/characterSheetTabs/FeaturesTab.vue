<template lang="html">
	<div class="features">
		<column-layout>
			<div v-for="feature in features" :key="feature._id">
				<feature-card
					v-bind="feature"
					:data-id="feature._id"
					@update="updateFeature"
					@click="featureClicked(feature)"
				/>
			</div>
		</column-layout>
	</div>
</template>

<script>
	import Creatures from '/imports/api/creature/Creatures.js';
	import Features, { updateFeature } from '/imports/api/properties/Features.js';
	import { insertFeature } from '/imports/api/properties/Features.js';
	import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
	import FeatureCard from '/imports/ui/properties/features/FeatureCard.vue';
	import { evaluateComputation, evaluateStringWithVariables } from '/imports/ui/utility/evaluate.js';

	export default {
		props: {
			charId: String,
		},
		components: {
			ColumnLayout,
			FeatureCard,
		},
		meteor: {
			features(){
				let char = Creatures.findOne(this.charId, {fields: {variables: 1}});
				if (!char) return [];
				let vars = char.variables;
				return Features.find({
					charId: this.charId,
				}, {
					sort: {order: 1},
				}).map(f => {
					f.description = evaluateStringWithVariables(f.description, vars);
					return f;
				});
			},
		},
		methods: {
			insertFeature(){
				const charId = this.charId;
				this.$store.commit('pushDialogStack', {
					component: 'feature-creation-dialog',
					elementId: 'insert-feature-fab',
					callback(feature){
						if (!feature) return;
						feature.charId = charId;
						let featureId = insertFeature.call(feature);
						return featureId
					}
				});
			},
			updateFeature({_id, update}, ack){
				updateFeature.call({_id, update}, error => {
					if (ack){
						ack(error);
					} else if(error) {
						throw error;
					}
				});
			},
			featureClicked(feature){
				this.$store.commit('pushDialogStack', {
					component: 'feature-dialog-container',
					elementId: feature._id,
					data: {_id: feature._id},
				});
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
