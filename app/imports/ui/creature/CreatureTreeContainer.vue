<template lang="html">
	<v-card-text style="width: initial; max-width: 100%; min-width: 320px;">
		<tree-node-list
			v-if="creatureChildren"
			:children="creatureChildren"
			:group="creature && creature._id"
			:organize="organize"
			:selected-node-id="selectedNodeId"
			@selected="e => $emit('selected', e)"
			@reordered="reordered"
			@reorganized="reorganized"
		/>
	</v-card-text>
</template>

<script>
	import Creatures from '/imports/api/creature/Creatures.js';
	import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
	import { nodesToTree } from '/imports/api/parenting/parenting.js'
	import TreeNodeList from '/imports/ui/components/tree/TreeNodeList.vue';
	import { organizeDoc, reorderDoc } from '/imports/api/parenting/organizeMethods.js';

	export default {
		components: {
			TreeNodeList,
		},
		props: {
			creatureId: String,
			organize: Boolean,
			selectedNodeId: String,
		},
		meteor: {
			$subscribe: {
				'creature': [this.creatureId],
			},
			creature(){
				return Creatures.findOne(this.creatureId);
			},
			creatureChildren(){
				if (!this.creature) return;
				return nodesToTree({collection: CreatureProperties, ancestorId: this.creatureId});
			},
		},
		methods: {
			reordered({doc, newIndex}){
				reorderDoc.call({
					docRef: {
						id: doc._id,
						collection: 'creatureProperties',
					},
					order: newIndex,
				});
			},
			reorganized({doc, parent, newIndex}){
				let parentRef;
				if (parent){
					parentRef = {
						id: parent._id,
						collection: 'creatureProperties',
					};
				} else {
					parentRef = {
						id: this.creatureId,
						collection: 'creatures',
					};
				}
				organizeDoc.call({
					docRef: {
						id: doc._id,
						collection: 'creatureProperties',
					},
					parentRef,
					order: newIndex,
				});
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
