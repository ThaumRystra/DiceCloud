<template lang="html">
	<div class="spells">
		<column-layout>
			<v-card>
				<v-switch
					v-model="organize"
					label="Organize"
					class="justify-end"
					style="margin: 16px 24px -16px;"
				/>
				<!-- Equipping things isn't implemented yet
				<creature-properties-tree
					:root="{collection: 'creatures', id: creatureId}"
					:filter="{
						equipped: true,
						type: 'spell',
						'ancestors.id': {$nin: spellListIds}
					}"
					@selected="e => clickProperty(e)"
					:organize="organize"
					group="spells"
				/>
				<v-divider/>
				-->
				<creature-properties-tree
					:root="{collection: 'creatures', id: creatureId}"
					:filter="{
						equipped: {$ne: true},
						type: 'spell',
						'ancestors.id': {$nin: spellListIds}
					}"
					@selected="e => clickProperty(e)"
					:organize="organize"
					group="spells"
				/>
			</v-card>
			<div v-for="spellList in spellListsWithoutAncestorSpellLists" :key="spellList._id">
				<spellList-card
					:model="spellList"
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
import SpellListCard from '/imports/ui/properties/components/spells/SpellListCard.vue';

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
		SpellListCard,
	},
	meteor: {
		spellLists(){
			return CreatureProperties.find({
				'ancestors.id': this.creatureId,
				type: 'spellList',
				removed: {$ne: true},
			}, {
				sort: {order: 1},
			});
		},
		spellListsWithoutAncestorSpellLists(){
			return CreatureProperties.find({
				'ancestors.id': {
					$eq: this.creatureId,
					$nin: this.spellListIds
				},
				type: 'spellList',
				removed: {$ne: true},
			}, {
				sort: {order: 1},
			});
		},
	},
	computed: {
		spellListIds(){
			return this.spellLists.map(spellList => spellList._id);
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
