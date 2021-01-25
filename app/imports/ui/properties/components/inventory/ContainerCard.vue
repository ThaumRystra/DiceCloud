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
      <item-list
        :items="items"
        :parent-ref="{id: model._id, collection: 'creatureProperties'}"
      />
    </v-card-text>
  </toolbar-card>
</template>

<script>
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import ItemList from '/imports/ui/properties/components/inventory/ItemList.vue';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

export default {
	components: {
		ToolbarCard,
    ItemList,
	},
	props: {
		model: {
      type: Object,
      required: true,
    },
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
	},
  meteor: {
    items(){
      return CreatureProperties.find({
        'parent.id': this.model._id,
        type: {$in: ['item', 'container']},
        removed: {$ne: true},
        equipped: {$ne: true},
        deactivatedByAncestor: {$ne: true},
      });
    },
  }
};
</script>

<style lang="css" scoped>
</style>
