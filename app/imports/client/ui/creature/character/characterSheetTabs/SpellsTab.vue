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

<script lang="js">
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import SpellListCard from '/imports/client/ui/properties/components/spells/SpellListCard.vue';
import SpellList from '/imports/client/ui/properties/components/spells/SpellList.vue';
import tabFoldersMixin from '/imports/client/ui/properties/components/folders/tabFoldersMixin';
import SpellSlotCard from '/imports/client/ui/properties/components/attributes/SpellSlotCard.vue';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default {
  components: {
    ColumnLayout,
    SpellList,
    SpellListCard,
    SpellSlotCard,
  },
  mixins: [tabFoldersMixin],
  props: {
    creatureId: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      organize: false,
      tabName: 'spells',
    }
  },
  meteor: {
    folderIds() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        type: 'folder',
        groupStats: true,
        hideStatsGroup: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, { fields: { _id: 1 } }).map(folder => folder._id);
    },
    hasSpellSlots() {
      return !!CreatureProperties.findOne({
        ...getFilter.descendantsOfRoot(this.creatureId),
        inactive: { $ne: true },
        removed: { $ne: true },
        overridden: { $ne: true },
        level: { $ne: 0 },
        type: 'attribute',
        attributeType: 'spellSlot',
      });
    },
    spellSlots() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        'parentId': {
          $nin: this.folderIds,
        },
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
        sort: { left: 1 }
      });
    },
    spellLists() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        'parentId': {
          $nin: this.folderIds,
        },
        type: 'spellList',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { left: 1 }
      }).fetch();
    },
    hasSpells() {
      return !!CreatureProperties.findOne({
        ...getFilter.descendantsOfRoot(this.creatureId),
        type: 'spell',
        removed: { $ne: true },
        inactive: { $ne: true },
      });
    },
    spellsWithoutList() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        $nor: [getFilter.descendantsOfAll(this.spellLists)],
        parentId: {
          $nin: this.folderIds,
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
        ...getFilter.descendantsOfRoot(this.creatureId),
        $nor: [getFilter.descendantsOfAll(this.spellLists)],
        parentId: {
          $nin: this.folderIds,
        },
        type: 'spellList',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { left: 1 }
      });
    },
  },
  computed: {
    spellListIds() {
      return this.spellLists.map(spellList => spellList._id);
    },
  },
}
</script>

<style lang="css" scoped>

</style>
