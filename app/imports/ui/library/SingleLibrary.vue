<template lang="html">
  <div
    class="layout row"
    style="background-color: inherit;"
  >
    <div
      class="layout column"
      style="
          background-color: inherit;
          width: initial;
          max-width: 100%;
          min-width: 320px;
        "
    >
      <v-toolbar
        dense
        flat
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
        :library-id="$route.params.id"
        :organize-mode="organize"
        :selected-node-id="selected"
        @selected="e => selected = e"
      />
    </div>
    <v-divider vertical />
    <div
      style="width: 100%; background-color: inherit;"
      data-id="selected-node-card"
    >
      <v-toolbar
        dense
        flat
      >
        <property-icon
          :model="selectedNode"
          class="mr-2"
        />
        <div class="title">
          {{ getPropertyName(selectedNode && selectedNode.type) }}
        </div>
        <v-spacer />
        <v-btn
          v-if="selectedNode"
          flat
          icon
          @click="editLibraryNode"
        >
          <v-icon>create</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text style="overflow-y: auto;">
        <property-viewer :model="selectedNode" />
      </v-card-text>
    </div>
  </div>
</template>

<script>
import PropertyViewer from '/imports/ui/properties/shared/PropertyViewer.vue';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import Libraries from '/imports/api/library/Libraries.js';
import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import LibraryContentsContainer from '/imports/ui/library/LibraryContentsContainer.vue';

export default {
	components: {
		LibraryContentsContainer,
		PropertyViewer,
		PropertyIcon,
	},
	data(){ return {
		organize: false,
		selected: undefined,
	};},
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
		getPropertyName,
	},
	meteor: {
		$subscribe: {
			'libraries': [],
		},
    library(){
      return Libraries.findOne(this.$route.params.id);
    },
		selectedNode(){
			return LibraryNodes.findOne({
				_id: this.selected,
				removed: {$ne: true}
			});
		}
	}
};
</script>

<style lang="css" scoped>
</style>
