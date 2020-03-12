<template lang="html">
	<div class="inventory">
		<column-layout>
			<div v-for="container in containers" :key="container._id">
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

export default {
	props: {
		creatureId: String,
	},
	components: {
		ColumnLayout,
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
			}).map(container => {
				container.items = CreatureProperties.find({
					'parent.id': container._id,
					removed: {$ne: true},
				}, {
					sort: {order: 1},
				}).fetch();
				return container;
			});
		},
	},
}
</script>

<style lang="css" scoped>
</style>
