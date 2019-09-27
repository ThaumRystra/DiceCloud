<template lang="html">
  <div class="tree-tab">
		<v-card class="ma-4 layout row" data-id="creature-tree-card">
			<div>
				<v-toolbar dense flat>
					<v-spacer/>
					<v-switch
						label="Organize"
						class="mx-3"
						v-model="organize"
						style="flex-grow: 0; height: 32px;"
					/>
				</v-toolbar>
				<creature-tree-container
					:creature-id="creatureId"
					:organize="organize"
					@selected="e => selected = e"
					:selected-node-id="selected"
				/>
			</div>
			<v-divider vertical/>
			<div style="width: 100%; background-color: inherit;" data-id="selected-node-card">
				<v-toolbar dense flat>
					<property-icon :type="selectedProperty && selectedProperty.type" class="mr-2"/>
					<div class="title">
						{{getPropertyName(selectedProperty && selectedProperty.type)}}
					</div>
					<v-spacer/>
					<v-btn flat icon @click="editCreatureProperty" v-if="selectedProperty">
						<v-icon>create</v-icon>
					</v-btn>
				</v-toolbar>
				<v-card-text>
					<property-viewer :model="selectedProperty"/>
				</v-card-text>
			</div>
		</v-card>
		<v-btn fixed fab bottom right
			color="primary"
			@click="insertCreatureProperty"
			data-id="insert-creature-property-fab"
		>
			<v-icon>add</v-icon>
		</v-btn>
  </div>
</template>

<script>
	import CreatureTreeContainer from '/imports/ui/creature/CreatureTreeContainer.vue';
	import CreatureProperties, { insertProperty } from '/imports/api/creature/CreatureProperties.js';
	import PropertyViewer from '/imports/ui/properties/PropertyViewer.vue';
	import { setDocToLastOrder } from '/imports/api/parenting/order.js';
	import PropertyIcon from '/imports/ui/properties/PropertyIcon.vue';
	import { getPropertyName } from '/imports/constants/PROPERTIES.js';

	export default {
		components: {
			CreatureTreeContainer,
			PropertyViewer,
			PropertyIcon,
		},
		data(){ return {
			organize: false,
			selected: undefined,
		};},
		props: {
			creatureId: {
				type: String,
			},
		},
		methods: {
			insertCreatureProperty(){
				let that = this;
				this.$store.commit('pushDialogStack', {
					component: 'creature-property-creation-dialog',
					elementId: 'insert-creature-property-fab',
					callback(creatureProperty){
						if (!creatureProperty) return;
						creatureProperty.parent = {collection: "creatures", id: that.creatureId};
						creatureProperty.ancestors = [ {collection: "creatures", id: that.creatureId}];
						setDocToLastOrder({collection: CreatureProperties, doc: creatureProperty});
						let creaturePropertyId = insertProperty.call(creatureProperty);
						return creaturePropertyId;
					}
				});
			},
			editCreatureProperty(){
				let that = this;
				this.$store.commit('pushDialogStack', {
					component: 'library-node-edit-dialog',
					elementId: 'selected-node-card',
					data: {_id: this.selected},
				});
			},
			getPropertyName,
		},
		meteor: {
			selectedProperty(){
				return CreatureProperties.findOne({
					_id: this.selected,
					removed: {$ne: true}
				});
			}
		}
	};
</script>

<style lang="css" scoped>
</style>
