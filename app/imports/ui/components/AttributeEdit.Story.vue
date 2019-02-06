<template lang="html">
	<div>
		<attribute-edit
			v-for="(attribute, index) in attributes"
			:key="attribute._id"
			:attribute="attribute"
			@change="e => {writeChange(e, index); log(e)}"
		/>
		<div class="ma-4" v-for="(attribute, index) in attributes">
			{{attribute}}
		</div>
	</div>
</template>

<script>
	import AttributeEdit from '/imports/ui/components/AttributeEdit.vue';
	import debounceUpdate from '/imports/ui/utility/debounceUpdate.js';
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
		created () {
			// Doing this here instead of in methods ensures every instance has its
			// own debounced function
		  this.writeChange = debounceUpdate((e, index) => {
				// Do work storing the change, this is where we'd write to the database
				for (let i in e){
					if (typeof e[i] === 'string'){
						e[i] = e[i].trim();
					}
					this.attributes[index][i] = e[i];
				}
			});
		},
		methods: {
			log: console.log,
		},
	};
</script>

<style lang="css" scoped>
</style>
