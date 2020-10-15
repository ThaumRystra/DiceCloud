<template lang="html">
  <dialog-base :color="model.color">
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
    </template>
    <div class="library-nodes">
      <v-fade-transition mode="out-in">
        <v-list v-if="$subReady.slotFillers && libraryNodes.length">
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
        <div
          v-else-if="$subReady.slotFillers"
          class="ma-4"
        >
          <h4>
            Nothing suitable was found in your libraries
          </h4>
          <p>
            This slot requires a {{ slotPropertyTypeName }}
            <template v-if="model.slotTags.length">
              with the following tags:
              <span
                v-for="(tag, index) in model.slotTags"
                :key="index"
              >
                <code>{{ tag }}</code>,
              </span>
            </template>
          </p>
        </div>
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
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
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
  computed: {
    slotPropertyTypeName(){
      if (!this.model) return;
      if (!this.model.slotType) return 'property';
      let propName = getPropertyName(this.model.slotType);
      return propName && propName.toLowerCase();
    },
  },
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
      let nodes = LibraryNodes.find(filter).fetch();
      if (nodes.length === 1) this.selectedNode = nodes[0];
      return nodes;
    },
  }
}
</script>

<style lang="css" scoped>
</style>
