<template lang="html">
  <div class="inventory">
    <column-layout wide-columns>
      <folder-group-card
        v-for="folder in startFolders"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />
      <div>
        <v-card>
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon>$vuetify.icons.injustice</v-icon>
              </template>
              <v-list-item-title>
                Weight Carried
              </v-list-item-title>
              <template #append>
                <v-list-item-title>
                  {{ weightCarried }} lb
                </v-list-item-title>
              </template>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon>$vuetify.icons.cash</v-icon>
              </template>
              <v-list-item-title>
                Net worth
              </v-list-item-title>
              <template #append>
                <v-list-item-title>
                  <coin-value :value="variables && variables.valueTotal && variables.valueTotal.value|| 0" />
                </v-list-item-title>
              </template>
            </v-list-item>
            <v-list-item v-if="variables && variables.itemsAttuned && variables.itemsAttuned.value">
              <template #prepend>
                <v-icon>$vuetify.icons.spell</v-icon>
              </template>
              <v-list-item-title>
                Items attuned
              </v-list-item-title>
              <template #append>
                <v-list-item-title>
                  {{ variables.itemsAttuned.value }}
                </v-list-item-title>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </div>
      <div>
        <toolbar-card transparent-toolbar>
          <template #toolbar>
            <v-toolbar-title>
              Equipped
            </v-toolbar-title>
          </template>
          <v-card-text class="px-0">
            <item-list
              equipment
              :item-ids="equippedItemIds"
              :parent="equipmentParent"
            />
          </v-card-text>
        </toolbar-card>
      </div>
      <div>
        <toolbar-card transparent-toolbar>
          <template #toolbar>
            <v-toolbar-title>
              Carried
            </v-toolbar-title>
          </template>
          <v-card-text class="px-0">
            <item-list
              :item-ids="carriedItemIds"
              :parent="carriedParent"
            />
          </v-card-text>
        </toolbar-card>
      </div>
      <div
        v-for="container in containersWithoutAncestorContainers"
        :key="container._id"
      >
        <container-card :model="container" />
      </div>
      <folder-group-card
        v-for="folder in endFolders"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />
    </column-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import Creatures from '/imports/api/creature/creatures/Creatures';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import ContainerCard from '/imports/client/ui/properties/components/inventory/ContainerCard.vue';
import ToolbarCard from '/imports/client/ui/components/ToolbarCard.vue';
import ItemList from '/imports/client/ui/properties/components/inventory/ItemList.vue';
import FolderGroupCard from '/imports/client/ui/properties/components/folders/FolderGroupCard.vue';
import getParentByTag from '/imports/api/creature/creatureProperties/methods/getParentByTag';
import BUILT_IN_TAGS from '/imports/constants/BUILT_IN_TAGS';
import CoinValue from '/imports/client/ui/components/CoinValue.vue';
import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

const props = defineProps<{ creatureId: string }>();
const store = useStore();
const tabName = 'inventory';
const organize = ref(false);

const { result: startFolders } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    groupStats: true,
    inactive: { $ne: true },
    removed: { $ne: true },
    tab: tabName,
    location: 'start',
  }, { sort: { left: 1 } }).fetch()
);

const { result: endFolders } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    groupStats: true,
    inactive: { $ne: true },
    removed: { $ne: true },
    tab: tabName,
    location: 'end',
  }, { sort: { left: 1 } }).fetch()
);

const { result: folderIds } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    type: 'folder',
    groupStats: true,
    hideStatsGroup: true,
    removed: { $ne: true },
    inactive: { $ne: true },
  }, { fields: { _id: 1 } }).map((folder: any) => folder._id)
);

const { result: containers } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    'parend': { $nin: folderIds.value || [] },
    type: 'container',
    removed: { $ne: true },
    inactive: { $ne: true },
  }, {
    sort: { left: 1 },
  }).fetch()
);

const { result: creature } = autorun(() =>
  Creatures.findOne(props.creatureId, { fields: { color: 1, variables: 1 } })
);

const { result: variables } = autorun(() =>
  CreatureVariables.findOne({ _creatureId: props.creatureId }) || {}
);

const { result: containersWithoutAncestorContainers } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    $nor: [getFilter.descendantsOfAll(containers.value || [])],
    parentId: { $nin: folderIds.value || [] },
    type: 'container',
    removed: { $ne: true },
    inactive: { $ne: true },
  }, {
    sort: { left: 1 },
  }).fetch()
);

const { result: carriedItemIds } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    $nor: [getFilter.descendantsOfAll(containers.value || [])],
    parentId: { $nin: folderIds.value || [] },
    type: 'item',
    equipped: { $ne: true },
    removed: { $ne: true },
    deactivatedByAncestor: { $ne: true },
    deactivatedByToggle: { $ne: true },
  }, {
    sort: { left: 1 },
    fields: { _id: 1 },
  }).map((prop: any) => prop._id)
);

const { result: equippedItemIds } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    type: 'item',
    equipped: true,
    removed: { $ne: true },
    inactive: { $ne: true },
  }, {
    sort: { left: 1 },
    fields: { _id: 1 },
  }).map((prop: any) => prop._id)
);

const { result: equipmentParent } = autorun(() =>
  getParentByTag(props.creatureId, BUILT_IN_TAGS.equipment) ||
  getParentByTag(props.creatureId, BUILT_IN_TAGS.inventory)
);

const { result: carriedParent } = autorun(() =>
  getParentByTag(props.creatureId, BUILT_IN_TAGS.carried) ||
  getParentByTag(props.creatureId, BUILT_IN_TAGS.inventory)
);

const weightCarried = computed(() =>
  stripFloatingPointOddities(
    (variables.value as any)?.weightCarried?.value || 0
  )
);

function clickProperty({ _id }: { _id: string }) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `${_id}`,
    data: { _id },
  });
}

function clickTreeProperty({ _id }: { _id: string }) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `tree-node-${_id}`,
    data: { _id },
  });
}

function softRemove(_id: string) {
  softRemoveProperty.call({ _id }, (error: any) => {
    if (error) {
      snackbar({ text: error.reason || error.message || error.toString() });
      console.error(error);
    }
  });
}
</script>

<style lang="css" scoped>

</style>
