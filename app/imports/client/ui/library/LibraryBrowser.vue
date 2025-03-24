<template lang="html">
  <div
    class="library-browser"
    style="
      background-color: inherit;
      overflow-y: auto;
    "
  >
    <v-expansion-panels
      v-model="expandedLibrary"
      accordian
      flat
      multiple
    >
      <v-expansion-panel
        v-for="library in libraries"
        :key="library._id"
        :data-id="library._id"
      >
        <v-expansion-panel-header>
          <div class="text-h6">
            {{ library.name }}
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-layout
            justify-space-around
            class="ma-2"
          >
            <insert-library-node-button
              v-if="editPermission(library)"
              :library-id="library._id"
              :selected-node-id="selectedNode && selectedNode._id"
              @selected="e => $emit('selected', e)"
            />
            <v-btn
              color="primary"
              outlined
              small
              @click="$router.push(`/library/${library._id}`)"
            >
              <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
          </v-layout>
          <library-contents-container
            :library-id="library._id"
            :organize-mode="organizeMode && editPermission(library)"
            :edit-mode="editMode"
            :selected-node="selectedNode"
            :filter="filter"
            should-subscribe
            @selected="e => $emit('selected', e)"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-btn
      v-show="noLibrariesExpanded"
      v-if="editMode"
      text
      color="primary"
      style="background-color: inherit;"
      data-id="insert-library-button"
      @click="insertLibrary"
    >
      <v-icon>mdi-plus</v-icon>
      New library
    </v-btn>
  </div>
</template>

<script lang="js">
import LibraryContentsContainer from '/imports/client/ui/library/LibraryContentsContainer.vue';
import Libraries, { insertLibrary } from '/imports/api/library/Libraries';
import { getUserTier } from '/imports/api/users/patreon/tiers';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import InsertLibraryNodeButton from '/imports/client/ui/library/InsertLibraryNodeButton.vue';

export default {
  components: {
    LibraryContentsContainer,
    InsertLibraryNodeButton,
  },
  props: {
    organizeMode: Boolean,
    editMode: Boolean,
    selectedNode: {
      type: Object,
      default: undefined,
    },
    filter: {
      type: Object,
      default: undefined,
    },
  },
  data(){ return {
    expandedLibrary: [],
    expandedLibraryContent: [],
  };},
  computed: {
    noLibrariesExpanded(){
      return !this.expandedLibrary || this.expandedLibrary.length === 0;
    },
  },
  meteor: {
    $subscribe: {
      'libraries': [],
    },
    libraries(){
      return Libraries.find({}, {
        sort: {name: 1}
      }).fetch();
    },
    paidBenefits(){
      let tier = getUserTier(Meteor.userId());
      return tier && tier.paidBenefits;
    },
  },
  methods: {
    insertLibrary(){
      if (this.paidBenefits){
        this.$store.commit('pushDialogStack', {
          component: 'library-creation-dialog',
          elementId: 'insert-library-button',
          callback(library){
            if (!library) return;
            let libraryId = insertLibrary.call(library);
            return libraryId;
          }
        });
      } else {
        this.$store.commit('pushDialogStack', {
          component: 'tier-too-low-dialog',
          elementId: 'insert-library-button',
        });
      }
    },
    editPermission(library){
      try {
        assertEditPermission(library, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
    editLibrary(_id){
      this.$store.commit('pushDialogStack', {
        component: 'library-edit-dialog',
        elementId: _id,
        data: {_id},
      });
    },
  },
}
</script>

<style lang="css">
.library-browser .v-expansion-panel-content__wrap, .library-browser .v-expansion-panel-header {
  padding: 0 !important;
}
</style>
