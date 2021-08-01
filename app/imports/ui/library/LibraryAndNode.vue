<template lang="html">
  <tree-detail-layout>
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
        <v-spacer />
        <v-switch
          v-if="!libraryId || canEditLibrary"
          v-model="organize"
          label="Organize"
          class="mx-3"
          style="flex-grow: 0; height: 32px;"
        />
        <tree-search-input
          ref="searchBox"
          slot="extension"
          v-model="filter"
          class="mx-4"
        />
        <insert-library-node-button
          v-if="libraryId && canEditLibrary"
          slot="extension"
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
      style="overflow: hidden;"
    >
      <library-node-dialog
        :_id="selectedNodeId"
        embedded
        @removed="selectedNodeId = undefined"
        @duplicated="id => {if ($vuetify.breakpoint.mdAndUp) selectedNodeId = id}"
      />
    </div>
  </tree-detail-layout>
</template>

<script lang="js">
import TreeDetailLayout from '/imports/ui/components/TreeDetailLayout.vue';
import LibraryBrowser from '/imports/ui/library/LibraryBrowser.vue';
import LibraryNodeDialog from '/imports/ui/library/LibraryNodeDialog.vue';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import Libraries from '/imports/api/library/Libraries.js';
import LibraryContentsContainer from '/imports/ui/library/LibraryContentsContainer.vue';
import InsertLibraryNodeButton from '/imports/ui/library/InsertLibraryNodeButton.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import isDarkColor from '/imports/ui/utility/isDarkColor.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';
import getThemeColor from '/imports/ui/utility/getThemeColor.js';
import TreeSearchInput from '/imports/ui/components/tree/TreeSearchInput.vue';

export default {
  components: {
    TreeDetailLayout,
    LibraryBrowser,
    LibraryNodeDialog,
    LibraryContentsContainer,
    InsertLibraryNodeButton,
    TreeSearchInput,
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
  };},
  computed: {
    isToolbarDark(){
      return isDarkColor(
        this.selectedNode && this.selectedNode.color ||
        getThemeColor('secondary')
      );
    }
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
