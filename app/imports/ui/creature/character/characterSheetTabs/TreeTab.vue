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
				<creature-properties-tree
					:root="{collection: 'creatures', id: creatureId}"
					:organize="organize"
					@selected="e => selected = e"
					:selected-node-id="selected"
					style="min-width: 320px;"
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
		<v-speed-dial
      v-model="fab"
			fixed
      bottom="bottom"
      right="right"
    >
      <template v-slot:activator>
        <v-btn
          v-model="fab"
          color="primary"
          fab
					data-id="insert-creature-property-fab"
        >
          <v-icon>add</v-icon>
          <v-icon>close</v-icon>
        </v-btn>
      </template>
			<v-tooltip disabled left :value="true" :nudge-left="16">
				Property from library
				<v-btn
					slot="activator"
					color="primary"
					small fab
					@click="propertyFromLibrary"
				>
					<v-icon>book</v-icon>
				</v-btn>
			</v-tooltip>
			<v-tooltip disabled left :value="true" :nudge-left="16">
				New property
				<v-btn
					slot="activator"
					color="primary"
					small fab
					@click="insertCreatureProperty"
				>
					<v-icon>edit</v-icon>
				</v-btn>
			</v-tooltip>
    </v-speed-dial>
  </div>
</template>

<script>
import CreaturePropertiesTree from '/imports/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
	import CreatureProperties, {
		insertProperty,
		insertPropertyFromLibraryNode
	} from '/imports/api/creature/CreatureProperties.js';
	import PropertyViewer from '/imports/ui/properties/shared/PropertyViewer.vue';
	import { setDocToLastOrder } from '/imports/api/parenting/order.js';
	import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
	import { getPropertyName } from '/imports/constants/PROPERTIES.js';

	export default {
		components: {
			CreaturePropertiesTree,
			PropertyViewer,
			PropertyIcon,
		},
		data(){ return {
			organize: false,
			selected: undefined,
			fab: false,
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
						let creaturePropertyId = insertProperty.call({creatureProperty});
						return creaturePropertyId;
					}
				});
			},
			propertyFromLibrary(){
				let that = this;
				this.$store.commit('pushDialogStack', {
					component: 'creature-property-from-library-dialog',
					elementId: 'insert-creature-property-fab',
					callback(libraryNode){
						if (!libraryNode) return;
						let propertyId = insertPropertyFromLibraryNode.call({
							nodeId: libraryNode._id,
							parentRef: {collection: 'creatures', id: that.creatureId},
						});
						return;
					}
				});
			},
			editCreatureProperty(){
				let that = this;
				this.$store.commit('pushDialogStack', {
					component: 'creature-property-dialog',
					elementId: 'selected-node-card',
					data: {
						_id: this.selected,
						startInEditTab: true,
					},
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
