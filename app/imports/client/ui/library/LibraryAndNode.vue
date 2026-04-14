<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useDisplay } from 'vuetify';
import { autorun } from 'vue-meteor-tracker';
import TreeDetailLayout from '/imports/client/ui/components/TreeDetailLayout.vue';
import LibraryBrowser from '/imports/client/ui/library/LibraryBrowser.vue';
import LibraryNodeDialog from '/imports/client/ui/library/LibraryNodeDialog.vue';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import Libraries from '/imports/api/library/Libraries';
import LibraryContentsContainer from '/imports/client/ui/library/LibraryContentsContainer.vue';
import InsertLibraryNodeButton from '/imports/client/ui/library/InsertLibraryNodeButton.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import { assertEditPermission } from '/imports/api/sharing/sharingPermissions';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import TreeSearchInput from '/imports/client/ui/components/tree/TreeSearchInput.vue';
import LibrarySecondTree from '/imports/client/ui/library/LibrarySecondTree.vue';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  selection?: boolean;
  libraryId?: string;
}>();

const emit = defineEmits(['selected']);

const store = useStore(key);
const display = useDisplay();

const organize = ref(false);
const selectedNodeId = ref<string | undefined>(undefined);
const filter = ref<string | undefined>(undefined);
const extraFields = ref<string[]>([]);
const showSecondTree = ref(false);

autorun(() => {
  if (props.libraryId) {
    Meteor.subscribe('library', props.libraryId);
  }
});

const { result: libraries } = autorun(() => {
  return Libraries.find({}, { sort: { name: 1 } }).fetch();
});

const { result: library } = autorun(() => {
  if (!props.libraryId) return undefined;
  return Libraries.findOne(props.libraryId);
});

const { result: canEditLibrary } = autorun(() => {
  if (!props.libraryId) return false;
  try {
    assertEditPermission(library.value, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

const { result: selectedNode } = autorun(() => {
  return LibraryNodes.findOne({
    _id: selectedNodeId.value,
    removed: { $ne: true },
  });
});

const isToolbarDark = computed(() => {
  return isDarkColor(
    (selectedNode.value && selectedNode.value.color) ||
    getThemeColor('secondary')
  );
});

watch(selectedNode, (val) => {
  emit('selected', val);
});

function editLibraryNode() {
  store.commit('pushDialogStack', {
    component: 'library-node-edit-dialog',
    elementId: 'selected-node-card',
    data: { _id: selectedNodeId.value },
  });
}

function clickNode(id: string) {
  if (display.mdAndUp) {
    selectedNodeId.value = id;
  } else {
    store.commit('pushDialogStack', {
      component: 'library-node-dialog',
      elementId: `tree-node-${id}`,
      data: {
        _id: id,
        selection: props.selection,
      },
      callback: (result: boolean) => {
        if (result) {
          selectedNodeId.value = id;
        }
      },
    });
  }
}
</script>

<template lang="html">
  <tree-detail-layout>
    <template #left-tree>
      <library-second-tree
        v-if="showSecondTree"
        :selected-node="selectedNode"
        @close="showSecondTree = false"
        @selected="clickNode"
      />
    </template>
    <template #tree>
      <div
        class="d-flex flex-column"
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
          :theme="isToolbarDark ? 'dark' : 'light'"
        >
          <tree-search-input
            ref="searchBox"
            v-model="filter"
            class="mx-4"
            :is-library="true"
            @extra-fields-changed="val => extraFields = val"
          />
          <v-spacer />
          <v-fade-transition>
            <v-menu v-if="organize && $vuetify.display.mdAndUp">
              <template #activator="{ props }">
                <v-btn
                  icon
                 
                  v-bind="props"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text>
                  <v-switch
                    v-model="showSecondTree"
                    label="Show second library tree"
                  />
                </v-card-text>
              </v-card>
            </v-menu>
          </v-fade-transition>
          <v-switch
            v-if="!libraryId || canEditLibrary"
            v-model="organize"
            hide-details
            label="Organize"
            class="ml-1 mr-3 mt-2"
            style="flex-grow: 0; height: 32px;"
          />
          <insert-library-node-button
            v-if="libraryId && canEditLibrary"
            style="bottom: -24px"
            :library-id="libraryId"
            :selected-node-id="selectedNodeId"
            @selected="id => { if ($vuetify.display.mdAndUp) selectedNodeId = id }"
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
            :extra-fields="extraFields"
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
    </template>
    <template #detail>
      <div
        data-id="selected-node-card"
        style="overflow: hidden; min-height: 100%;"
      >
        <library-node-dialog
          :_id="selectedNodeId"
          embedded
          @removed="selectedNodeId = undefined"
          @duplicated="id => { if ($vuetify.display.mdAndUp) selectedNodeId = id }"
          @select-sub-property="id => selectedNodeId = id"
        />
      </div>
    </template>
  </tree-detail-layout>
</template>

<style lang="css" scoped></style>
