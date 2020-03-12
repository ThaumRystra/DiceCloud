<template lang="html">
	<toolbar-card :color="model.color" @click="clickProperty(model._id)" :data-id="model._id">
		<template slot="toolbar">
			<span>
				{{model.name}}
			</span>
			<v-spacer/>
		</template>
		<v-list>
			<item-list-tile
				v-for="item in items"
				:model="item"
				:key="item._id"
				:data-id="item._id"
				@click="clickProperty(item._id)"
			/>
		</v-list>
  </toolbar-card>
</template>

<script>
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import ItemListTile from '/imports/ui/properties/components/inventory/ItemListTile.vue';

export default {
	props: {
		model: Object,
		items: [Array, Object],
	},
	components: {
		ToolbarCard,
		ItemListTile,
	},
	methods: {
		clickProperty(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `${_id}`,
				data: {_id},
			});
		},
	}
};
</script>

<style lang="css" scoped>
</style>
