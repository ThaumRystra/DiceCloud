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

<script lang="js">
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import PrintedSpell from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedSpell.vue';
import PrintedSpellList from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedSpellList.vue';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default {
  components: {
    ColumnLayout,
    PrintedSpell,
    PrintedSpellList,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      organize: false,
    }
  },
  meteor: {
    spellLists() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        type: 'spellList',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { left: 1 }
      }).fetch();
    },
    spellsWithoutList() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        $nor: [getFilter.descendantsOfAll(this.spellLists)],
        type: 'spell',
        removed: { $ne: true },
        deactivatedByAncestor: { $ne: true },
        deactivatedByToggle: { $ne: true },
      }, {
        sort: {
          level: 1,
          order: 1,
        }
      });
    },
    spellListsWithoutAncestorSpellLists() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        $nor: [getFilter.descendantsOfAll(this.spellLists)],
        type: 'spellList',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { left: 1 }
      }).map(sl => {
        sl.spells = CreatureProperties.find({
          ...getFilter.descendants(sl),
          type: 'spell',
          removed: { $ne: true },
          inactive: { $ne: true },
        }, {
          sort: {
            level: 1,
            order: 1,
          }
        }).fetch();
        return sl;
      });
    },
  },
  computed: {
    spellListIds() {
      return this.spellLists?.map(spellList => spellList._id);
    },
  },
}
</script>

<style lang="css" scoped>

</style>
