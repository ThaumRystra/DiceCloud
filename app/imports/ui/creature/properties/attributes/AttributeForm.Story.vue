<template lang="html">
	<div>
		<attribute-edit
			v-for="(attribute, index) in attributes"
			:key="attribute._id"
			:attribute="attribute"
			@change="(e, ack) => change(index, e, ack)"
		/>
		<div class="ma-4" v-for="(attribute, index) in attributes">
			{{attribute}}
		</div>
	</div>
</template>

<script>
	import AttributeForm from '/imports/ui/creature/properties/attributes/AttributeForm.vue';
	import debounceUpdate from '/imports/ui/utility/debounceUpdate.js';
	export default {
		components: {
			AttributeForm,
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
			change(index, e, ack){
				// Take a while to write the attribute
				setTimeout(() => {
					for (let i in e){
						let val = e[i];
						if (typeof val === 'string') val = val.trim();
						this.attributes[index][i] = val;
					}
					if (ack) ack();
				}, 600)
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
