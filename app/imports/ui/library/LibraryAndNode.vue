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
      </v-toolbar>
      <div
        v-if="libraryId"
        style="width: 100%; height: 100%; overflow: auto;"
      >
        <library-contents-container
          :library-id="libraryId"
          :organize-mode="organize"
          :selected-node-id="selected"
          should-subscribe
          @selected="clickNode"
        />
      </div>
      <library-browser
        v-else
        edit-mode
        :organize-mode="organize"
        :selected-node-id="selected"
        style="overflow-y: auto;"
        @selected="clickNode"
      />
    </div>
    <div
      slot="detail"
      data-id="selected-node-card"
      style="overflow: hidden;"
    >
      <library-node-dialog
        :_id="selected"
        embedded
        @removed="selected = undefined"
      />
    </div>
  </tree-detail-layout>
</template>

<script>
import TreeDetailLayout from '/imports/ui/components/TreeDetailLayout.vue';
import LibraryBrowser from '/imports/ui/library/LibraryBrowser.vue';
import LibraryNodeDialog from '/imports/ui/library/LibraryNodeDialog.vue';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import Libraries from '/imports/api/library/Libraries.js';
import LibraryContentsContainer from '/imports/ui/library/LibraryContentsContainer.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import isDarkColor from '/imports/ui/utility/isDarkColor.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';

export default {
  components: {
    TreeDetailLayout,
    LibraryBrowser,
    LibraryNodeDialog,
    LibraryContentsContainer,
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
    selected: undefined,
  };},
  computed: {
    isToolbarDark(){
      return isDarkColor(
        this.selectedNode && this.selectedNode.color ||
        this.$vuetify.theme.secondary
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
        data: {_id: this.selected},
      });
    },
    clickNode(id){
      if (this.$vuetify.breakpoint.mdAndUp){
        this.selected = id;
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
              this.selected = id;
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
        _id: this.selected,
        removed: {$ne: true}
      });
    },
  }
};
</script>

<style lang="css" scoped>
</style>
