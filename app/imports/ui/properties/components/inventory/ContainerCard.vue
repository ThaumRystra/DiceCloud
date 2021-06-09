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
      <v-toolbar-title>
        <v-icon
          small
          style="width: 16px;"
          class="mr-1"
        >
          $vuetify.icons.weight
        </v-icon>
        {{ (model.contentsWeightless ? 0 : model.contentsWeight || 0) + (model.weight || 0) }}
      </v-toolbar-title>
      <v-toolbar-title
        class="layout align-center"
        style="flex-grow: 0;"
      >
        <v-icon
          small
          style="width: 16px;"
          class="mr-1"
        >
          $vuetify.icons.two_coins
        </v-icon>
        <coin-value
          :value="(model.contentsValue || 0) + (model.value || 0)"
        />
      </v-toolbar-title>
    </template>
    <v-card-text class="px-0">
      <item-list
        :items="items"
        :parent-ref="{id: model._id, collection: 'creatureProperties'}"
      />
    </v-card-text>
  </toolbar-card>
</template>

<script lang="js">
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import ItemList from '/imports/ui/properties/components/inventory/ItemList.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import CoinValue from '/imports/ui/components/CoinValue.vue';

export default {
	components: {
		ToolbarCard,
    ItemList,
    CoinValue,
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
      }, {
        sort: {order: 1},
      });
    },
  }
};
</script>

<style lang="css" scoped>
</style>
