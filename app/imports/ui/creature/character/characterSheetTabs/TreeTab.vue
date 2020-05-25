<template lang="html">
  <div
    class="tree-tab pa-4 layout column align-center"
    style="height: calc(100vh - 96px); display: flex;"
  >
    <v-card
      style="height: 100%; width: 100%; max-width: 1800px;"
      data-id="creature-tree-card"
    >
      <tree-detail-layout>
        <template slot="tree">
          <v-toolbar
            flat
            dense
          >
            <v-spacer />
            <v-switch
              v-if="context.editPermission !== false"
              v-model="organize"
              label="Organize"
              class="mx-3"
              :disabled="organizeDisabled"
              style="flex-grow: 0; height: 32px;"
            />
            <v-combobox
              ref="searchBox"
              slot="extension"
              v-model="filterString"
              :items="filterOptions"
              prepend-inner-icon="search"
              class="mx-4"
              hide-no-data
              hide-selected
              multiple
              clearable
              small-chips
              deletable-chips
            />
          </v-toolbar>
          <creature-properties-tree
            class="pt-2 flex"
            style="overflow-y: auto;"
            :root="{collection: 'creatures', id: creatureId}"
            :organize="organize"
            :selected-node-id="selected"
            :filter="filter"
            @selected="clickNode"
          />
        </template>
        <template slot="detail">
          <creature-property-dialog
            embedded
            :_id="selected"
            @removed="selected = undefined"
          />
        </template>
      </tree-detail-layout>
    </v-card>
    <v-speed-dial
      v-model="fab"
      fixed
      bottom="bottom"
      right="right"
    >
      <template #activator>
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
      <labeled-fab
        color="primary"
        label="Property from library"
        icon="book"
        @click="propertyFromLibrary"
      />
      <labeled-fab
        color="primary"
        label="New property"
        icon="edit"
        @click="insertCreatureProperty"
      />
    </v-speed-dial>
  </div>
</template>

<script>
  import TreeDetailLayout from '/imports/ui/components/TreeDetailLayout.vue';
  import CreaturePropertiesTree from '/imports/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
  import CreaturePropertyDialog from '/imports/ui/creature/creatureProperties/CreaturePropertyDialog.vue';
  import LabeledFab from '/imports/ui/components/LabeledFab.vue';

  import CreatureProperties, {
    insertProperty,
    insertPropertyFromLibraryNode
  } from '/imports/api/creature/CreatureProperties.js';
  import { setDocToLastOrder } from '/imports/api/parenting/order.js';
  import { getPropertyName } from '/imports/constants/PROPERTIES.js';

  export default {
    components: {
      TreeDetailLayout,
      CreaturePropertiesTree,
      CreaturePropertyDialog,
      LabeledFab,
    },
    inject: {
      context: { default: {} }
    },
    props: {
      creatureId: {
        type: String,
        required: true,
      },
    },
    data(){ return {
      organize: false,
      organizeDisabled: false,
      selected: undefined,
      fab: false,
      filterString: '',
      filterOptions: [
        {text: 'Actions', value: 'action'},
        {text: 'Attacks', value: 'attack'},
        {text: 'Attributes', value: 'attribute'},
        {text: 'Buffs', value: 'buff'},
        {text: 'Class Levels', value: 'classLevel'},
        {text: 'Damage Multipliers', value: 'damageMultiplier'},
        {text: 'Effects', value: 'effect'},
        {text: 'Experiences', value: 'experience'},
        {text: 'Features', value: 'feature'},
        {text: 'Folders', value: 'folder'},
        {text: 'Notes', value: 'note'},
        {text: 'Proficiencies', value: 'proficiency'},
        {text: 'Rolls', value: 'roll'},
        {text: 'Saving Throws', value: 'savingThrow'},
        {text: 'Skills', value: 'skill'},
        {text: 'Spell Lists', value: 'spellList'},
        {text: 'Spells', value: 'spell'},
        {text: 'Containers', value: 'container'},
        {text: 'Items', value: 'item'},
      ],
    };},
    computed: {
      filter(){
        if (!this.filterString.length) return;
        let typeFilters = [];
        let nameFilters = [];
        this.filterString.forEach(filter => {
          if (filter.value){
            typeFilters.push(filter.value);
          } else {
            // escape string
            let term = filter.replace( /[-/\\^$*+?.()|[\]{}]/g, '\\$&' );
            var reg = new RegExp( '.*' + term + '.*', 'i' );
            nameFilters.push(reg)
          }
        });
        return {$or: [
          {type: {$in: typeFilters}},
          {name: {$in: nameFilters}},
        ]};
      },
    },
    watch: {
      filter(filter){
        if (filter) {
          this.organize = false;
          this.organizeDisabled = true;
        } else {
          this.organizeDisabled = false;
        }
      },
      '$vuetify.breakpoint.mdAndUp'(mdAndUp){
        if (!mdAndUp){
          this.selected = undefined;
        }
      },
    },
    methods: {
      clickNode(id){
        if (this.$vuetify.breakpoint.mdAndUp){
          this.selected = id;
        } else {
          this.$store.commit('pushDialogStack', {
            component: 'creature-property-dialog',
            elementId: `tree-node-${id}`,
            data: {
              _id: id,
            },
          });
        }
      },
      insertCreatureProperty(){
        let that = this;
        this.$store.commit('pushDialogStack', {
          component: 'creature-property-creation-dialog',
          elementId: 'insert-creature-property-fab',
          callback(creatureProperty){
            if (!creatureProperty) return;
            creatureProperty.parent = {collection: 'creatures', id: that.creatureId};
            creatureProperty.ancestors = [ {collection: 'creatures', id: that.creatureId}];
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
            insertPropertyFromLibraryNode.call({
              nodeId: libraryNode._id,
              parentRef: {collection: 'creatures', id: that.creatureId},
            });
          }
        });
      },
      editCreatureProperty(){
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
