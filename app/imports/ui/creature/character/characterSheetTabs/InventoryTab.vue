<template lang="html">
  <div class="inventory">
    <column-layout wide-columns>
      <div>
        <toolbar-card :color="$vuetify.theme.secondary">
          <v-spacer slot="toolbar" />
          <v-switch
            v-if="context.editPermission !== false"
            slot="toolbar"
            v-model="organize"
            label="Organize"
            class="justify-end"
          />
          <v-card-text class="px-0">
            <creature-properties-tree
              :root="{collection: 'creatures', id: creatureId}"
              :filter="{
                type: {$in: ['item']},
                'ancestors.id': {$nin: containerIds}
              }"
              :organize="organize"
              group="inventory"
              @selected="e => clickProperty(e)"
              @reorganized="({doc}) => setEquipped(doc, false)"
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
          :organize="organize"
        />
      </div>
    </column-layout>
  </div>
</template>

<script>
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
import CreaturePropertiesTree from '/imports/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import ContainerCard from '/imports/ui/properties/components/inventory/ContainerCard.vue';
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import { updateProperty } from '/imports/api/creature/CreatureProperties.js';

export default {
	components: {
		ColumnLayout,
		CreaturePropertiesTree,
		ContainerCard,
    ToolbarCard,
	},
  inject: {
    context: { default: {} }
  },
	props: {
		creatureId: String,
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
			}, {
				sort: {order: 1},
			});
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
