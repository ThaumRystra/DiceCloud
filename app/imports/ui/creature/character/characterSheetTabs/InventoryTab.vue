<template lang="html">
  <div class="inventory">
    <column-layout wide-columns>
      <div>
        <toolbar-card
          :color="context.creature.color"
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
          :color="context.creature.color"
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
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
import ContainerCard from '/imports/ui/properties/components/inventory/ContainerCard.vue';
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import ItemList from '/imports/ui/properties/components/inventory/ItemList.vue';
import { updateProperty } from '/imports/api/creature/CreatureProperties.js';
import { getParentRefByTag } from '/imports/api/creature/creatureProperties/manageEquipment.js';
import INVENTORY_TAGS from '/imports/constants/INVENTORY_TAGS.js';

export default {
	components: {
		ColumnLayout,
		ContainerCard,
    ToolbarCard,
    ItemList,
	},
  inject: {
    context: { default: {} }
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
    setEquipped(doc, equipped){
      updateProperty.call({
        _id: doc._id,
        path: ['equipped'],
        value: equipped
      });
    }
	},
}
</script>

<style lang="css" scoped>
</style>
