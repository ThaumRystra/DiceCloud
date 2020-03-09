<template lang="html">
	<div class="features">
		<column-layout>
			<div v-for="feature in features" :key="feature._id">
				<feature-card
					v-bind="feature"
					:data-id="feature._id"
					@click="featureClicked(feature)"
				/>
			</div>
		</column-layout>
	</div>
</template>

<script>
	import Creatures from '/imports/api/creature/Creatures.js';
	import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
	import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
	import FeatureCard from '/imports/ui/properties/components/features/FeatureCard.vue';
	import { evaluateComputation, evaluateStringWithVariables } from '/imports/ui/utility/evaluate.js';

	export default {
		props: {
			creatureId: String,
		},
		components: {
			ColumnLayout,
			FeatureCard,
		},
		meteor: {
			features(){
				let char = Creatures.findOne(this.creatureId, {fields: {variables: 1}});
				if (!char) return [];
				let vars = char.variables;
				return CreatureProperties.find({
					'ancestors.id': this.creatureId,
					type: 'feature',
					removed: {$ne: true},
				}, {
					sort: {order: 1},
				}).map(f => {
					f.description = evaluateStringWithVariables(f.description, vars);
					return f;
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
