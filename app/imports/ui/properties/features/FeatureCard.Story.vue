<template lang="html">
	<column-layout>
		<div
			v-for="(feature, index) in features"
			:key="index"
		>
			<feature-card
				v-bind="feature"
			/>
		</div>
	</column-layout>
</template>

<script>
	import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
	import FeatureCard from '/imports/ui/properties/features/FeatureCard.vue';

	export default {
		dontWrap: true,
		components: {
			ColumnLayout,
			FeatureCard,
		},
		data(){return {
			features: [
				{
					name: 'Feature 1',
					enabled: true,
					alwaysEnabled: true,
					description: `

					blah blah, with

					spacing
					`,
					color: '#f44336',
				}, {
					name: 'Feature 2',
					enabled: false,
					alwaysEnabled: false,
					description: `Short Description`,
					uses: 5,
					used: 2,
				},
			],
		}},
	}
</script>

<style lang="css' scoped>
</style>
