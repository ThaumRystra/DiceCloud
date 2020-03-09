<template lang="html">
	<v-card-text style="width: initial; max-width: 100%; min-width: 320px;">
		<tree-node-list
			v-if="root"
			:children="children"
			:group="root.id"
			:organize="organize"
			:selected-node-id="selectedNodeId"
			@selected="e => $emit('selected', e)"
			@reordered="reordered"
			@reorganized="reorganized"
		/>
	</v-card-text>
</template>

<script>
	import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
	import { nodesToTree } from '/imports/api/parenting/parenting.js'
	import TreeNodeList from '/imports/ui/components/tree/TreeNodeList.vue';
	import { organizeDoc, reorderDoc } from '/imports/api/parenting/organizeMethods.js';

	export default {
		components: {
			TreeNodeList,
		},
		props: {
			root: Object,
			organize: Boolean,
			selectedNodeId: String,
		},
		meteor: {
			children(){
				return nodesToTree({collection: CreatureProperties, ancestorId: this.root.id});
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
					parentRef = this.root;
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
