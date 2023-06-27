<template lang="html">
  <div
    class="spells"
  >
    <column-layout wide-columns>
      <div class="span-all">
        <div class="label text-center octagon-border">
          Spells
        </div>
      </div>
      <div
        v-for="spell in spellsWithoutList"
        :key="spell._id"
      >
        <printed-spell :model="spell" />
      </div>
      <template
        v-for="spellList in spellListsWithoutAncestorSpellLists"
      >
        <div
          :key="spellList._id"
          class="span-all"
        >
          <printed-spell-list
            :model="spellList"
          />
        </div>
        <div
          v-for="spell in spellList.spells"
          :key="spell._id"
        >
          <printed-spell :model="spell" />
        </div>
      </template>
    </column-layout>
  </div>
</template>

<script lang="js">
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import PrintedSpell from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedSpell.vue';
import PrintedSpellList from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedSpellList.vue';

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
        'ancestors.id': this.creatureId,
        type: 'spellList',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { order: 1 }
      });
    },
    spellsWithoutList() {
      return CreatureProperties.find({
        'ancestors.id': {
          $eq: this.creatureId,
          $nin: this.spellListIds,
        },
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
        'ancestors.id': {
          $eq: this.creatureId,
          $nin: this.spellListIds,
        },
        type: 'spellList',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { order: 1 }
      }).map(sl => {
        sl.spells = CreatureProperties.find({
          'ancestors.id': sl._id,
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
