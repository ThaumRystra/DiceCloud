<template lang="html">
	<div>
		<attribute-edit
			v-for="attribute in attributes"
			:key="attribute._id"
			:attribute="attribute"
			@change="log"
		/>
	</div>
</template>

<script>
	import AttributeEdit from '/imports/ui/components/AttributeEdit.vue';
	export default {
		components: {
			AttributeEdit,
		},
		data(){ return {
			attributes: [
				{
					_id: Random.id(),
					name: 'Strength',
					variableName: 'strength',
					order: 4,
					type: 'ability',
					baseValue: 10,
					value: 14,
					mod: 2,
					adjustment: -2,
					decimal: false,
					reset: undefined,
					resetMultiplier: undefined,
					color: '#aa0000',
				},
			],
		}},
		methods: {
			log: console.log,
			change(index, e){
				for (let i in e){
					this.attributes[index][i] = e[i];
				}
			},
		},
	}
</script>

<style lang="css" scoped>
</style>
