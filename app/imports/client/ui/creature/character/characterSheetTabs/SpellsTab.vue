<template lang="html">
  <div class="spells">
    <column-layout wide-columns>
      <folder-group-card
        v-for="folder in startFolders"
        :key="folder._id"
        :model="folder"
        @click-property="clickProperty"
        @sub-click="_id => clickTreeProperty({_id})"
        @remove="softRemove"
      />
      <div
        v-if="hasSpellSlots || hasSpells"
        class="spell-slots"
      >
        <spell-slot-card
          :creature-id="creatureId"
          :spell-slots="spellSlots"
          :has-spells="hasSpells"
        />
      </div>
      <div v-if="spellsWithoutList.length">
        <v-card>
          <spell-list
            :spells="spellsWithoutList"
            :parent-ref="{id: creatureId, collection: 'creatures'}"
          />
        </v-card>
      </div>
      <div
        v-for="spellList in spellListsWithoutAncestorSpellLists"
        :key="spellList._id"
      >
        <spellList-card
          :model="spellList"
          :organize="organize"
        />
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
import { computed } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import SpellListCard from '/imports/client/ui/properties/components/spells/SpellListCard.vue';
import SpellList from '/imports/client/ui/properties/components/spells/SpellList.vue';
import FolderGroupCard from '/imports/client/ui/properties/components/folders/FolderGroupCard.vue';
import SpellSlotCard from '/imports/client/ui/properties/components/attributes/SpellSlotCard.vue';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

const props = defineProps<{ creatureId: string }>();
const store = useStore();
const tabName = 'spells';

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

const { result: hasSpellSlots } = autorun(() =>
  !!CreatureProperties.findOne({
    ...getFilter.descendantsOfRoot(props.creatureId),
    inactive: { $ne: true },
    removed: { $ne: true },
    overridden: { $ne: true },
    level: { $ne: 0 },
    type: 'attribute',
    attributeType: 'spellSlot',
  })
);

const { result: spellSlots } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    'parentId': { $nin: folderIds.value || [] },
    inactive: { $ne: true },
    removed: { $ne: true },
    overridden: { $ne: true },
    type: 'attribute',
    attributeType: 'spellSlot',
    $nor: [
      { hideWhenTotalZero: true, total: 0 },
      { hideWhenValueZero: true, value: 0 },
    ],
  }, {
    sort: { left: 1 },
  }).fetch()
);

const { result: spellLists } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    'parentId': { $nin: folderIds.value || [] },
    type: 'spellList',
    removed: { $ne: true },
    inactive: { $ne: true },
  }, {
    sort: { left: 1 },
  }).fetch()
);

const { result: hasSpells } = autorun(() =>
  !!CreatureProperties.findOne({
    ...getFilter.descendantsOfRoot(props.creatureId),
    type: 'spell',
    removed: { $ne: true },
    inactive: { $ne: true },
  })
);

const { result: spellsWithoutList } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    $nor: [getFilter.descendantsOfAll(spellLists.value || [])],
    parentId: { $nin: folderIds.value || [] },
    type: 'spell',
    removed: { $ne: true },
    deactivatedByAncestor: { $ne: true },
    deactivatedByToggle: { $ne: true },
  }, {
    sort: { level: 1, order: 1 },
  }).fetch()
);

const { result: spellListsWithoutAncestorSpellLists } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    $nor: [getFilter.descendantsOfAll(spellLists.value || [])],
    parentId: { $nin: folderIds.value || [] },
    type: 'spellList',
    removed: { $ne: true },
    inactive: { $ne: true },
  }, {
    sort: { left: 1 },
  }).fetch()
);

const spellListIds = computed(() =>
  (spellLists.value || []).map((sl: any) => sl._id)
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
