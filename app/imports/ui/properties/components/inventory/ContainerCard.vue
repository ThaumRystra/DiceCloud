<template lang="html">
  <toolbar-card
    :color="model.color"
    :data-id="model._id"
    @toolbarclick="clickContainer(model._id)"
  >
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer />
    </template>
    <v-card-text class="px-0">
      <creature-properties-tree
        :root="{collection: 'creatureProperties', id: model._id}"
        :filter="{type: {$in: ['container', 'item', 'folder']}}"
        :organize="organize"
        group="inventory"
        @selected="e => clickProperty(e)"
      />
    </v-card-text>
  </toolbar-card>
</template>

<script>
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import CreaturePropertiesTree from '/imports/ui/creature/creatureProperties/CreaturePropertiesTree.vue';

export default {
	components: {
		ToolbarCard,
		CreaturePropertiesTree,
	},
	props: {
		model: Object,
		organize: Boolean,
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
