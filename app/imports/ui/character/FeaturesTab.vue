<template lang="html">
	<div class="features">
		<column-layout>
			<div v-for="feature in features" :key="feature._id">
				<feature-card
				v-bind="feature"
				:data-id="feature._id"
				/>
			</div>
		</column-layout>

		<v-btn fixed fab bottom right
			color="primary"
			@click="insertFeature"
			data-id="insert-feature-fab"
		>
			<v-icon>add</v-icon>
		</v-btn>
	</div>
</template>

<script>
	import Creatures from '/imports/api/creature/Creatures.js';
	import Features from '/imports/api/creature/properties/Features.js';
	import { insertFeature } from '/imports/api/creature/properties/Features.js';
	import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
	import FeatureCard from '/imports/ui/components/features/FeatureCard.vue';
	import { evaluateComputation, evaluateString } from '/imports/ui/utility/evaluate.js';

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
					f.uses = evaluateComputation(f.uses, vars);
					f.description = evaluateString(f.description, vars);
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
						let featureId = insertFeature.call({feature});
						return featureId
					}
				});
			}
		}
	};
</script>

<style lang="css" scoped>
</style>
