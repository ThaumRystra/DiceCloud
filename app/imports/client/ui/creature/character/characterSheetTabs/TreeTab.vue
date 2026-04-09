<template lang="html">
  <div
    class="tree-tab pa-4 layout column align-center"
    style="height: calc(100vh - 96px); display: flex;"
  >
    <v-card
      style="height: 100%; width: 100%; max-width: 1800px;"
      data-id="creature-tree-card"
    >
      <tree-detail-layout>
        <template #tree>
          <v-toolbar
            flat
            dark
            style="flex-grow: 0;"
          >
            <tree-search-input
              ref="searchBox"
              v-model="filter"
              class="mx-4"
            />
            <v-spacer />
            <v-switch
              v-if="context.editPermission !== false"
              v-model="organize"
              label="Organize"
              class="mx-3"
              :disabled="organizeDisabled"
              style="flex-grow: 0; height: 32px;"
            />
          </v-toolbar>
          <creature-properties-tree
            class="pt-2 flex"
            style="overflow-y: auto;"
            :root="{collection: 'creatures', id: creatureId}"
            :organize="organize"
            :selected-node="selectedNode"
            :filter="filter"
            @selected="clickNode"
          />
        </template>
        <template #detail>
          <creature-property-dialog
            embedded
            :_id="selectedNodeId"
            @removed="selectedNodeId = undefined"
            @duplicated="id => selectedNodeId = id"
            @select-sub-property="clickNode"
          />
        </template>
      </tree-detail-layout>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import { useStore } from 'vuex';
import { useDisplay } from 'vuetify';
import { autorun } from 'vue-meteor-tracker';
import TreeDetailLayout from '/imports/client/ui/components/TreeDetailLayout.vue';
import CreaturePropertiesTree from '/imports/client/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import CreaturePropertyDialog from '/imports/client/ui/creature/creatureProperties/CreaturePropertyDialog.vue';
import TreeSearchInput from '/imports/client/ui/components/tree/TreeSearchInput.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { getPropertyName } from '/imports/constants/PROPERTIES';

const props = defineProps<{ creatureId: string }>();
const store = useStore();
const display = useDisplay();
const context = inject('context', {} as any);

const organize = ref(false);
const organizeDisabled = ref(false);
const selectedNodeId = ref<string | undefined>(undefined);
const fab = ref(false);
const filter = ref<string | undefined>(undefined);

watch(filter, (val) => {
  if (val) {
    organize.value = false;
    organizeDisabled.value = true;
  } else {
    organizeDisabled.value = false;
  }
});

watch(() => display.mdAndUp.value, (mdAndUp) => {
  if (!mdAndUp) {
    selectedNodeId.value = undefined;
  }
});

const { result: selectedNode } = autorun(() =>
  CreatureProperties.findOne({
    _id: selectedNodeId.value,
    removed: { $ne: true },
  })
);

function clickNode(id: string) {
  if (display.mdAndUp.value) {
    selectedNodeId.value = id;
  } else {
    store.commit('pushDialogStack', {
      component: 'creature-property-dialog',
      elementId: `tree-node-${id}`,
      data: { _id: id },
    });
  }
}

function editCreatureProperty() {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: 'selected-node-card',
    data: {
      _id: selectedNodeId.value,
      startInEditTab: true,
    },
  });
}
</script>

<style lang="css" scoped>
</style>
