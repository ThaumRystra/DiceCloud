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
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';

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
      return getActiveProperties({
        ancestorId: this.model._id,
        includeUnequipped: true,
        filter: {
          type: {$in: ['item', 'container']},
          'parent.id': this.model._id,
          equipped: {$ne: true},
        },
      });
    },
  }
};
</script>

<style lang="css" scoped>
</style>
