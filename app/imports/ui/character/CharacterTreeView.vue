<template lang="html">
  <v-treeview :items="treeItems">
		<template slot="label" slot-scope="{ item, open }">
			<span v-if="item.collection === 'attributes' || item.collection === 'skills'">
				{{item.name}}: {{item.value}}
			</span>
			<span v-else-if="item.collection === 'effects'">
				{{item.name}}: {{item.stat}} {{item.operation}} {{item.result}}
			</span>
			<span v-else>
				{{item.name}}
			</span>
    </template>
  </v-treeview>
</template>

<script>
	import creatureCollections from '/imports/api/creature/creatureCollections.js';
	export default {
		name: 'character-tree-view',
		props: {
			charId: String,
		},
		computed: {
			treeItems(){
				let docsByParent = this.characterDocsByParent;
				let buildDoc = (oldDoc) => {
					let doc = {...oldDoc};
					if (docsByParent[doc._id]){
						doc.children = [];
						for (let group in docsByParent[doc._id]){
							if (group === 'ungrouped'){
								doc.children.push(...docsByParent[doc._id][group].map(buildDoc))
							} else {
								doc.children.push({
									name: group,
									type: 'group',
									children: docsByParent[doc._id][group].map(buildDoc),
								});
							}
						}
					}
					return doc;
				}
				return buildDoc({
					_id: 'unparented',
				}).children;
			},
		},
		meteor: {
			characterDocsByParent(){
				let parentIndex = {unparented: {}};
				for (collection of creatureCollections){
					collection.find({
						charId: this.charId
					}, {
						sort: {order: 1}
					}).forEach(doc => {
						doc.collection = collection._name;
						let parentId = doc.parent && doc.parent.id;
						let parentGroup = (doc.parent && doc.parent.group) || 'ungrouped'
						if (parentId && parentId !== this.charId){
							if (!parentIndex[parentId]){
								parentIndex[parentId] = {};
							}
							if (!parentIndex[parentId][parentGroup]){
								parentIndex[parentId][parentGroup] = [];
							}
							parentIndex[parentId][parentGroup].push(doc);
						} else {
							if (!parentIndex.unparented[parentGroup]){
								parentIndex.unparented[parentGroup] = [];
							}
							parentIndex.unparented[parentGroup].push(doc);
						}
					});
				}
				return parentIndex;
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
