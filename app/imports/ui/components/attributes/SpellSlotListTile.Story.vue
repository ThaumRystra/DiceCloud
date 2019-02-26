<template lang="html">
	<v-list>
		<spell-slot-list-tile
			v-for="(slot, index) in spellSlots"
			:key="'tile ' + index"
			v-bind="slot"
			@change="e => spellSlots[index].adjustment += e.value"
		/>
	</v-list>
</template>

<script>
	import SpellSlotListTile from '/imports/ui/components/attributes/SpellSlotListTile.vue';

	export default {
		components: {
			SpellSlotListTile,
		},
		data(){return {
			spellSlots: [
				{
					name: "Level 1",
					value: 4,
					adjustment: -2,
				}, {
					name: "Level 1",
					value: 1,
					adjustment: 0,
				}, {
					name: "Level 2",
					value: 12,
					adjustment: -8,
				}, {
					name: "Level 3",
					value: 10,
					adjustment: -5,
				},
			],
		}}
	};
</script>

<style lang="css" scoped>
</style>
