<template lang="html">
  <dialog-base :color="model.color">
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
    </template>
    <div class="library-nodes">
      <v-fade-transition mode="out-in">
        <v-list v-if="$subReady.slotFillers">
          <v-list-tile
            v-for="node in libraryNodes"
            :key="node._id"
            :class="node._id === (selectedNode && selectedNode._id) && 'primary--text'"
            @click="selectedNode = node"
          >
            <tree-node-view
              :model="node"
              :selected="node._id === (selectedNode && selectedNode._id)"
            />
          </v-list-tile>
        </v-list>
        <h4
          v-else-if="$subReady.slotFillers"
          class="ma-4"
        >
          Nothing suitable was found in your libraries
        </h4>
        <div
          v-else
          key="character-loading"
          class="fill-height layout justify-center align-center"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          />
        </div>
      </v-fade-transition>
    </div>
    <template slot="actions">
      <v-spacer />
      <v-btn
        flat
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
      <v-btn
        flat
        :disabled="!selectedNode"
        @click="$store.dispatch('popDialogStack', selectedNode)"
      >
        Insert
      </v-btn>
    </template>
  </dialog-base>
</template>

<script>
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';

export default {
  components: {
		DialogBase,
    TreeNodeView,
	},
  props:{
    slotId: {
      type: String,
      required: true,
    }
  },
  data(){return {
    selectedNode: undefined,
  }},
  meteor: {
    $subscribe: {
      'slotFillers'(){
        return [this.slotId]
      },
    },
    model(){
      return CreatureProperties.findOne(this.slotId);
    },
    libraryNodes(){
      let filter = {
        tags: {$all: this.model.slotTags},
      };
      if (this.model.slotType){
        filter.type = this.model.slotType;
      }
      return LibraryNodes.find(filter);
    },
  }
}
</script>

<style lang="css" scoped>
</style>
