<template lang="html">
	<div class="inventory">
		<column-layout>
			<v-card>
				<v-card-actions>
					<v-switch v-model="organize" label="Organize"/>
				</v-card-actions>
				<!-- Equipping things isn't implemented yet
				<creature-properties-tree
					:root="{collection: 'creatures', id: creatureId}"
					:filter="{
						equipped: true,
						type: {$in: ['item']},
						'ancestors.id': {$nin: containerIds}
					}"
					@selected="e => clickProperty(e)"
					:organize="organize"
					group="inventory"
				/>
				<v-divider/>
				-->
				<creature-properties-tree
					:root="{collection: 'creatures', id: creatureId}"
					:filter="{
						equipped: {$ne: true},
						type: {$in: ['item']},
						'ancestors.id': {$nin: containerIds}
					}"
					@selected="e => clickProperty(e)"
					:organize="organize"
					group="inventory"
				/>
			</v-card>
			<div v-for="container in containers" :key="container._id">
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

export default {
	props: {
		creatureId: String,
	},
	data(){ return {
		organize: false,
	}},
	components: {
		ColumnLayout,
		CreaturePropertiesTree,
		ContainerCard,
	},
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
