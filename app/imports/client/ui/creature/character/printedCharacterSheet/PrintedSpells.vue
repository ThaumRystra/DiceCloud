<template lang="html">
  <div
    class="spells"
  >
    <div
      class="label text-center octagon-border my-2 avoid-page-break-after"
    >
      Spells
    </div>
    <column-layout
      v-if="spellsWithoutList && spellsWithoutList.length"
      wide-columns
    >
      <div
        v-for="spell in spellsWithoutList"
        :key="spell._id"
      >
        <printed-spell :model="spell" />
      </div>
    </column-layout>
    <div
      v-for="spellList in spellListsWithoutAncestorSpellLists"
      :key="spellList._id"
    >
      <printed-spell-list
        :model="spellList"
      />
      <column-layout wide-columns>
        <div
          v-for="spell in spellList.spells"
          :key="spell._id"
        >
          <printed-spell :model="spell" />
        </div>
      </column-layout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import PrintedSpell from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedSpell.vue';
import PrintedSpellList from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedSpellList.vue';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

const props = defineProps<{ creatureId: string }>();

const { result: spellLists } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    type: 'spellList',
    removed: { $ne: true },
    inactive: { $ne: true },
  }, { sort: { left: 1 } }).fetch()
);

const { result: spellsWithoutList } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    $nor: [getFilter.descendantsOfAll(spellLists.value || [])],
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
    type: 'spellList',
    removed: { $ne: true },
    inactive: { $ne: true },
  }, { sort: { left: 1 } }).map((sl: any) => {
    sl.spells = CreatureProperties.find({
      ...getFilter.descendants(sl),
      type: 'spell',
      removed: { $ne: true },
      inactive: { $ne: true },
    }, { sort: { level: 1, order: 1 } }).fetch();
    return sl;
  })
);

const spellListIds = computed(() =>
  (spellLists.value || []).map((sl: any) => sl._id)
);
</script>

<style lang="css" scoped>

</style>
