<template lang="html">
  <v-container grid-list-md>
  	<v-layout row wrap>
  		<v-flex xs12 v-for="attribute in attributes" :key="attribute.name">
  			<attribute-card v-bind="attribute" @click="click"/>
  		</v-flex>
  	</v-layout>
	</v-container>
</template>

<script>
	import AttributeCard from '/imports/ui/components/AttributeCard.vue';
	export default {
		components: {
			AttributeCard
		},
		dontWrap: true,
		data(){ return {
			attributes: [
				{
					name: 'Speed',
					value: 30,
				}, {
					name: 'Initiative',
					value: 2,
					modifier: true,
				},{
					name: 'Proficiency Bonus',
					value: -2,
					modifier: true,
				},
			],
		}},
		methods: {
			click() {
				console.log(...arguments)
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
