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
        <v-expansion-panel-title>
          <div class="text-h6">
            {{ library.name }}
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="d-flex justify-space-around ma-2">
            <insert-library-node-button
              v-if="editPermission(library)"
              :library-id="library._id"
              :selected-node-id="selectedNode && selectedNode._id"
              @selected="e => $emit('selected', e)"
            />
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              @click="$router.push(`/library/${library._id}`)"
            >
              <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
          </div>
          <library-contents-container
            :library-id="library._id"
            :organize-mode="organizeMode && editPermission(library)"
            :edit-mode="editMode"
            :selected-node="selectedNode"
            :filter="filter"
            should-subscribe
            @selected="e => $emit('selected', e)"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-btn
      v-show="noLibrariesExpanded"
      v-if="editMode"
      variant="text"
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

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import LibraryContentsContainer from '/imports/client/ui/library/LibraryContentsContainer.vue';
import Libraries, { insertLibrary } from '/imports/api/library/Libraries';
import { getUserTier } from '/imports/api/users/patreon/tiers';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import InsertLibraryNodeButton from '/imports/client/ui/library/InsertLibraryNodeButton.vue';

const props = defineProps<{
  organizeMode?: boolean;
  editMode?: boolean;
  selectedNode?: Record<string, any>;
  filter?: Record<string, any>;
}>();

const store = useStore();

const expandedLibrary = ref<string[]>([]);
const expandedLibraryContent = ref<string[]>([]);

const noLibrariesExpanded = computed(() =>
  !expandedLibrary.value || expandedLibrary.value.length === 0
);

subscribe('libraries');

const { result: libraries } = autorun(() =>
  Libraries.find({}, { sort: { name: 1 } }).fetch()
);

const { result: paidBenefits } = autorun(() => {
  const tier = getUserTier(Meteor.userId());
  return tier && tier.paidBenefits;
});

function insertLibraryFn() {
  if (paidBenefits.value) {
    store.commit('pushDialogStack', {
      component: 'library-creation-dialog',
      elementId: 'insert-library-button',
      async callback(library: any) {
        if (!library) return;
        return await insertLibrary.callAsync(library);
      },
    });
  } else {
    store.commit('pushDialogStack', {
      component: 'tier-too-low-dialog',
      elementId: 'insert-library-button',
    });
  }
}

function editPermission(library: any) {
  try {
    assertEditPermission(library, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
}

function editLibrary(_id: string) {
  store.commit('pushDialogStack', {
    component: 'library-edit-dialog',
    elementId: _id,
    data: { _id },
  });
}
</script>

<style lang="css">
.library-browser .v-expansion-panel-text__wrapper, .library-browser .v-expansion-panel-title {
  padding: 0 !important;
}
</style>
