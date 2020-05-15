<template lang="html">
  <toolbar-card
    :color="model.color"
    :data-id="model._id"
    @toolbarclick="clickSpellList(model._id)"
  >
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer />
    </template>
    <v-card-text>
      <creature-properties-tree
        :root="{collection: 'creatureProperties', id: model._id}"
        :filter="{type: {$in: ['spellList', 'spell', 'folder']}}"
        :organize="organize"
        group="spells"
        @selected="e => clickProperty(e)"
      />
    </v-card-text>
  </toolbar-card>
</template>

<script>
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
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
		clickSpellList(_id){
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
