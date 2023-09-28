<template lang="html">
  <div class="d-flex flex-column fill-height">
    <v-fade-transition mode="out-in">
      <v-toolbar
        v-if="libraryId"
        dark
        flat
        color="secondary"
      >
        <v-btn
          icon
          @click="libraryId = undefined"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title
          key="library-name"
          class="d-flex"
        >
          <div class="flex-shrink-1">
            {{ library && library.name }}
          </div>
          <v-spacer />
        </v-toolbar-title>
        <v-btn
          v-if="library && ($route.params.id !== library._id)"
          icon
          @click="libraryId = undefined; $router.push({ name: 'singleLibrary', params: { id: library._id }})"
        >
          <v-icon>mdi-arrow-right-bold</v-icon>
        </v-btn>
      </v-toolbar>
      <v-toolbar
        v-else
        dark
        flat
        color="secondary"
      >
        <v-toolbar-title
          key="no-library"
        >
          <v-btn
            icon
            @click="$emit('close')"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          Select Library
        </v-toolbar-title>
      </v-toolbar>
    </v-fade-transition>
    <v-sheet
      class="pa-3 flex-grow-1 flex-shrink-1"
      style="overflow: auto;"
    >
      <v-fade-transition mode="out-in">
        <library-list
          v-if="!libraryId"
          selection
          single-select
          @select-library="id => libraryId = id"
        />
        <library-contents-container
          v-else
          :library-id="libraryId"
          :organize-mode="canEditLibrary"
          should-subscribe
          :selected-node="selectedNode"
          @selected="e => $emit('selected', e)"
        />
      </v-fade-transition>
    </v-sheet>
  </div>
</template>

<script lang="js">
import LibraryList from '/imports/client/ui/library/LibraryList.vue';
import LibraryContentsContainer from '/imports/client/ui/library/LibraryContentsContainer.vue';
import Libraries from '/imports/api/library/Libraries';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';

export default {
  components: {
    LibraryList,
    LibraryContentsContainer,
  },
  props: {
    selectedNode: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      libraryId: undefined
    };
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
    library() {
      return Libraries.findOne(this.libraryId);
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
  },
}
</script>

<style lang="css" scoped>
</style>
