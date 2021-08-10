<template lang="html">
  <tree-node-list
    v-if="root"
    :children="children"
    :group="group"
    :organize="organize"
    :selected-node="selectedNode"
    @selected="e => $emit('selected', e)"
    @reordered="reordered"
    @reorganized="reorganized"
  />
</template>

<script lang="js">
	import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
	import nodesToTree from '/imports/api/parenting/nodesToTree.js'
	import TreeNodeList from '/imports/ui/components/tree/TreeNodeList.vue';
	import { organizeDoc, reorderDoc } from '/imports/api/parenting/organizeMethods.js';

	export default {
		components: {
			TreeNodeList,
		},
		props: {
			root: Object,
			organize: Boolean,
			selectedNode: {
        type: Object,
        default: undefined,
      },
      filter: {
        type: Object,
        default: undefined,
      },
			group: {
				type: String,
				default: 'creatureProperties'
			}
		},
		meteor: {
			children(){
				return nodesToTree({
					collection: CreatureProperties,
					ancestorId: this.root.id,
					filter: this.filter,
          includeFilteredDocAncestors: true,
          includeFilteredDocDescendants: true,
				});
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
