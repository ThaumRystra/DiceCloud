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
          v-model="organize"
          label="Organize"
          class="mx-3"
          style="flex-grow: 0; height: 32px;"
        />
      </v-toolbar>
      <library-contents-container
        :library-id="library._id"
        :organize-mode="organize"
        :edit-mode="editMode"
        :selected-node-id="selected"
        should-subscribe
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
import LibraryNodeDialog from '/imports/ui/library/LibraryNodeDialog.vue';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import Libraries from '/imports/api/library/Libraries.js';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import isDarkColor from '/imports/ui/utility/isDarkColor.js';
import LibraryContentsContainer from '/imports/ui/library/LibraryContentsContainer.vue';

export default {
  components: {
    TreeDetailLayout,
    LibraryContentsContainer,
    LibraryNodeDialog,
  },
  props: {
    selection: Boolean,
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
    'library.name'(value){
      this.$store.commit('setPageTitle', value || 'Library');
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
    library(){
      return Libraries.findOne(this.$route.params.id);
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
