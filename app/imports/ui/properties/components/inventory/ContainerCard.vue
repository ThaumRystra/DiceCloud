<template lang="html">
	<toolbar-card :color="model.color" @toolbarclick="clickContainer(model._id)" :data-id="model._id">
		<template slot="toolbar">
			<span>
				{{model.name}}
			</span>
			<v-spacer/>
		</template>
		<creature-properties-tree
			:root="{collection: 'creatureProperties', id: model._id}"
			:filter="{type: {$in: ['container', 'item', 'folder']}}"
			@selected="e => clickProperty(e)"
			:organize="organize"
			group="inventory"
		/>
  </toolbar-card>
</template>

<script>
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import ItemListTile from '/imports/ui/properties/components/inventory/ItemListTile.vue';
import CreaturePropertiesTree from '/imports/ui/creature/creatureProperties/CreaturePropertiesTree.vue';

export default {
	props: {
		model: Object,
		organize: Boolean,
	},
	components: {
		ToolbarCard,
		ItemListTile,
		CreaturePropertiesTree,
	},
	methods: {
		clickContainer(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `${_id}`,
				data: {_id},
			});
		},
		clickProperty(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `tree-node-${_id}`,
				data: {_id},
			});
		},
	}
};
</script>

<style lang="css" scoped>
</style>
