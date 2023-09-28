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
            dark
            style="flex-grow: 0;"
          >
            <tree-search-input
              ref="searchBox"
              v-model="filter"
              class="mx-4"
            />
            <v-spacer />
            <v-switch
              v-if="context.editPermission !== false"
              v-model="organize"
              label="Organize"
              class="mx-3"
              :disabled="organizeDisabled"
              style="flex-grow: 0; height: 32px;"
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
            @select-sub-property="clickNode"
          />
        </template>
      </tree-detail-layout>
    </v-card>
  </div>
</template>

<script lang="js">
  import TreeDetailLayout from '/imports/client/ui/components/TreeDetailLayout.vue';
  import CreaturePropertiesTree from '/imports/client/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
  import CreaturePropertyDialog from '/imports/client/ui/creature/creatureProperties/CreaturePropertyDialog.vue';
  import TreeSearchInput from '/imports/client/ui/components/tree/TreeSearchInput.vue';
  import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
  import { getPropertyName } from '/imports/constants/PROPERTIES';

  export default {
    components: {
      TreeDetailLayout,
      TreeSearchInput,
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
      filter: undefined,
    };},
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
