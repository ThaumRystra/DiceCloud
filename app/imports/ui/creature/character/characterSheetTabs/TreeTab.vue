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
            style="flex-grow: 0;"
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
              prepend-inner-icon="mdi-search"
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
            :selected-node="selectedNode"
            :filter="filter"
            @selected="clickNode"
          />
        </template>
        <template slot="detail">
          <creature-property-dialog
            embedded
            :_id="selectedNodeId"
            @removed="selectedNodeId = undefined"
            @duplicated="id => selectedNodeId = id"
          />
        </template>
      </tree-detail-layout>
    </v-card>
  </div>
</template>

<script lang="js">
  import TreeDetailLayout from '/imports/ui/components/TreeDetailLayout.vue';
  import CreaturePropertiesTree from '/imports/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
  import CreaturePropertyDialog from '/imports/ui/creature/creatureProperties/CreaturePropertyDialog.vue';

  import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
  import { getPropertyName } from '/imports/constants/PROPERTIES.js';

  export default {
    components: {
      TreeDetailLayout,
      CreaturePropertiesTree,
      CreaturePropertyDialog,
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
      selectedNodeId: undefined,
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
          this.selectedNodeId = undefined;
        }
      },
    },
    methods: {
      clickNode(id){
        if (this.$vuetify.breakpoint.mdAndUp){
          this.selectedNodeId = id;
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
      editCreatureProperty(){
        this.$store.commit('pushDialogStack', {
          component: 'creature-property-dialog',
          elementId: 'selected-node-card',
          data: {
            _id: this.selectedNodeId,
            startInEditTab: true,
          },
        });
      },
      getPropertyName,
    },
    meteor: {
      selectedNode(){
        return CreatureProperties.findOne({
          _id: this.selectedNodeId,
          removed: {$ne: true}
        });
      }
    }
  };
</script>

<style lang="css" scoped>
</style>
