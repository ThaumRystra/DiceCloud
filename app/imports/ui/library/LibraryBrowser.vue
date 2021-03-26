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
          <library-contents-container
            :library-id="library._id"
            :organize-mode="organizeMode && editPermission(library)"
            :edit-mode="editMode"
            :selected-node-id="selectedNodeId"
            should-subscribe
            class="mb-4"
            @selected="e => $emit('selected', e)"
          />
          <v-layout>
            <v-btn
              text
              small
              style="background-color: inherit; margin-top: 0;"
              :disabled="!editPermission(library)"
              :data-id="`insert-node-${library._id}`"
              @click="insertLibraryNode(library._id)"
            >
              <v-icon>add</v-icon>
              New property
            </v-btn>
            <v-spacer />
            <v-btn
              small
              icon
              @click="$router.push(`/library/${library._id}`)"
            >
              <v-icon>arrow_forward</v-icon>
            </v-btn>
          </v-layout>
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
      <v-icon>add</v-icon>
      New library
    </v-btn>
  </div>
</template>

<script lang="js">
import LibraryContentsContainer from '/imports/ui/library/LibraryContentsContainer.vue';
import Libraries, { insertLibrary } from '/imports/api/library/Libraries.js';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions.js';

export default {
  components: {
    LibraryContentsContainer,
  },
  props: {
    organizeMode: Boolean,
    editMode: Boolean,
    selectedNodeId: {
      type: String,
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
    log: console.log,
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
