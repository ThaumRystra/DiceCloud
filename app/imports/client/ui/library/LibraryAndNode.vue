<template lang="html">
  <tree-detail-layout>
    <library-second-tree
      v-if="showSecondTree"
      slot="left-tree"
      :selected-node="selectedNode"
      @close="showSecondTree = false"
      @selected="clickNode"
    />
    <div
      slot="tree"
      class="layout column"
      style="
        background-color: inherit;
        width: initial;
        max-width: 100%;
        min-width: 320px;
        height: 100%;
      "
    >
      <v-toolbar
        flat
        :color="selectedNode && selectedNode.color || 'secondary'"
        :dark="isToolbarDark"
        :light="!isToolbarDark"
      >
        <tree-search-input
          ref="searchBox"
          v-model="filter"
          class="mx-4"
          @extra-fields-changed="val => extraFields = val"
        />
        <v-spacer />
        <v-fade-transition>
          <v-menu v-if="organize && $vuetify.breakpoint.mdAndUp">
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text>
                <v-switch
                  v-model="showSecondTree"
                  label="Show second library tree"
                />
              </v-card-text>
            </v-card>
          </v-menu>
        </v-fade-transition>
        <v-switch
          v-if="!libraryId || canEditLibrary"
          v-model="organize"
          hide-details
          label="Organize"
          class="ml-1 mr-3 mt-2"
          style="flex-grow: 0; height: 32px;"
        />
        <insert-library-node-button
          v-if="libraryId && canEditLibrary"
          style="bottom: -24px"
          fab
          :library-id="libraryId"
          :selected-node-id="selectedNodeId"
          @selected="id => {if ($vuetify.breakpoint.mdAndUp) selectedNodeId = id}"
        />
      </v-toolbar>
      <div
        v-if="libraryId"
        style="width: 100%; height: 100%; overflow: auto; padding: 12px;"
      >
        <library-contents-container
          :library-id="libraryId"
          :organize-mode="organize"
          :selected-node="selectedNode"
          :extra-fields="extraFields"
          should-subscribe
          :filter="filter"
          @selected="clickNode"
        />
      </div>
      <library-browser
        v-else
        edit-mode
        :organize-mode="organize"
        :selected-node="selectedNode"
        style="overflow-y: auto; padding: 12px;"
        :filter="filter"
        @selected="clickNode"
      />
    </div>
    <div
      slot="detail"
      data-id="selected-node-card"
      style="overflow: hidden; min-height: 100%;"
    >
      <library-node-dialog
        :_id="selectedNodeId"
        embedded
        @removed="selectedNodeId = undefined"
        @duplicated="id => {if ($vuetify.breakpoint.mdAndUp) selectedNodeId = id}"
        @select-sub-property="id => selectedNodeId = id"
      />
    </div>
  </tree-detail-layout>
</template>

<script lang="js">
import TreeDetailLayout from '/imports/client/ui/components/TreeDetailLayout.vue';
import LibraryBrowser from '/imports/client/ui/library/LibraryBrowser.vue';
import LibraryNodeDialog from '/imports/client/ui/library/LibraryNodeDialog.vue';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import Libraries from '/imports/api/library/Libraries';
import LibraryContentsContainer from '/imports/client/ui/library/LibraryContentsContainer.vue';
import InsertLibraryNodeButton from '/imports/client/ui/library/InsertLibraryNodeButton.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import TreeSearchInput from '/imports/client/ui/components/tree/TreeSearchInput.vue';
import LibrarySecondTree from '/imports/client/ui/library/LibrarySecondTree.vue';

export default {
  components: {
    TreeDetailLayout,
    LibraryBrowser,
    LibraryNodeDialog,
    LibraryContentsContainer,
    InsertLibraryNodeButton,
    TreeSearchInput,
    LibrarySecondTree,
  },
  props: {
    selection: Boolean,
    libraryId: {
      type: String,
      default: undefined,
    },
  },
  data(){ return {
    organize: false,
    selectedNodeId: undefined,
    filter: undefined,
    extraFields: [],
    showSecondTree: false,
  };},
  computed: {
    isToolbarDark(){
      return isDarkColor(
        this.selectedNode && this.selectedNode.color ||
        getThemeColor('secondary')
      );
    },
  },
  watch:{
    selectedNode(val){
      this.$emit('selected', val)
    },
  },
  methods: {
    editLibraryNode(){
      this.$store.commit('pushDialogStack', {
        component: 'library-node-edit-dialog',
        elementId: 'selected-node-card',
        data: {_id: this.selectedNodeId},
      });
    },
    clickNode(id){
      if (this.$vuetify.breakpoint.mdAndUp){
        this.selectedNodeId = id;
      } else {
        this.$store.commit('pushDialogStack', {
          component: 'library-node-dialog',
          elementId: `tree-node-${id}`,
          data: {
            _id: id,
            selection: this.selection,
          },
          callback: result => {
            if (result){
              this.selectedNodeId = id;
            }
          },
        });
      }
    },
    getPropertyName,
  },
  meteor: {
    $subscribe: {
      'library'(){
        if (this.libraryId){
          return [this.libraryId]
        } else {
          return [];
        }
      },
    },
    libraries(){
      return Libraries.find({}, {
        sort: {name: 1}
      }).fetch();
    },
    library(){
      let libraryId = this.libraryId;
      if (!libraryId) return;
      return Libraries.findOne(libraryId);
    },
    canEditLibrary(){
      if (!this.libraryId) return;
      try {
        assertEditPermission(this.library, Meteor.userId());
        return true;
      } catch (e){
        return false;
      }
    },
    selectedNode(){
      return LibraryNodes.findOne({
        _id: this.selectedNodeId,
        removed: {$ne: true}
      });
    },
  }
};
</script>

<style lang="css" scoped>
</style>
