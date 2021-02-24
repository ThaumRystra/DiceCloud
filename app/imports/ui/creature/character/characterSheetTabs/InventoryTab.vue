<template lang="html">
  <div class="inventory">
    <column-layout wide-columns>
      <div>
        <v-card>
          <v-list>
            <v-list-tile>
              <v-list-tile-avatar>
                <v-icon>$vuetify.icons.injustice</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>
                  Weight Carried
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-list-tile-title>
                  {{ creature.denormalizedStats.weightCarried || 0 }} lbs
                </v-list-tile-title>
              </v-list-tile-action>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-avatar>
                <v-icon>$vuetify.icons.cash</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>
                  Net worth
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-list-tile-title>
                  <coin-value
                    :value="creature.denormalizedStats.valueTotal || 0"
                  />
                </v-list-tile-title>
              </v-list-tile-action>
            </v-list-tile>
            <v-list-tile v-if="creature.denormalizedStats.itemsAttuned">
              <v-list-tile-avatar>
                <v-icon>$vuetify.icons.spell</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>
                  Items attuned
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-list-tile-title>
                  {{ creature.denormalizedStats.itemsAttuned }}
                </v-list-tile-title>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card>
      </div>
      <div>
        <toolbar-card
          :color="creature.color"
        >
          <v-toolbar-title slot="toolbar">
            Equipped
          </v-toolbar-title>
          <v-card-text class="px-0">
            <item-list
              equipment
              :items="equippedItems"
              :parent-ref="equipmentParentRef"
            />
          </v-card-text>
        </toolbar-card>
      </div>
      <div>
        <toolbar-card
          :color="creature.color"
        >
          <v-toolbar-title slot="toolbar">
            Carried
          </v-toolbar-title>
          <v-card-text class="px-0">
            <item-list
              :items="carriedItems"
              :parent-ref="carriedParentRef"
            />
          </v-card-text>
        </toolbar-card>
      </div>
      <div
        v-for="container in containersWithoutAncestorContainers"
        :key="container._id"
      >
        <container-card
          :model="container"
        />
      </div>
    </column-layout>
  </div>
</template>

<script>
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/Creatures.js';
import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
import ContainerCard from '/imports/ui/properties/components/inventory/ContainerCard.vue';
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import ItemList from '/imports/ui/properties/components/inventory/ItemList.vue';
import { getParentRefByTag } from '/imports/api/creature/creatureProperties/methods/equipItem.js';
import INVENTORY_TAGS from '/imports/constants/INVENTORY_TAGS.js';
import CoinValue from '/imports/ui/components/CoinValue.vue';

export default {
	components: {
		ColumnLayout,
		ContainerCard,
    ToolbarCard,
    ItemList,
    CoinValue,
	},
	props: {
		creatureId: {
      type: String,
      required: true,
    },
	},
	data(){ return {
		organize: false,
	}},
	meteor: {
		containers(){
			return CreatureProperties.find({
				'ancestors.id': this.creatureId,
				type: 'container',
				removed: {$ne: true},
        inactive: {$ne: true},
			}, {
				sort: {order: 1},
			});
		},
    creature(){
      return Creatures.findOne(this.creatureId, {fields: {
        color: 1,
        denormalizedStats: 1,
      }});
    },
		containersWithoutAncestorContainers(){
			return CreatureProperties.find({
				'ancestors.id': {
					$eq: this.creatureId,
					$nin: this.containerIds
				},
				type: 'container',
				removed: {$ne: true},
        inactive: {$ne: true},
			}, {
				sort: {order: 1},
			});
		},
    carriedItems(){
      return CreatureProperties.find({
        'ancestors.id': {
					$eq: this.creatureId,
					$nin: this.containerIds
				},
				type: 'item',
        equipped: {$ne: true},
				removed: {$ne: true},
        deactivatedByAncestor: {$ne: true},
			}, {
				sort: {order: 1},
			});
    },
    equippedItems(){
      return CreatureProperties.find({
        'ancestors.id': {
					$eq: this.creatureId,
				},
				type: 'item',
        equipped: true,
				removed: {$ne: true},
        inactive: {$ne: true},
			}, {
				sort: {order: 1},
			});
    },
    equipmentParentRef(){
      return getParentRefByTag(this.creatureId, INVENTORY_TAGS.equipment);
    },
    carriedParentRef(){
      return getParentRefByTag(this.creatureId, INVENTORY_TAGS.carried);
    },
	},
	computed: {
		containerIds(){
			return this.containers.map(container => container._id);
		},
	},
	methods: {
		clickProperty(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `tree-node-${_id}`,
				data: {_id},
			});
		},
	},
}
</script>

<style lang="css" scoped>
</style>
