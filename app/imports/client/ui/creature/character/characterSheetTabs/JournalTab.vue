<template>
  <div class="build-tab">
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
        <creature-summary :creature="creature" />
      </div>
      <div
        v-for="note in notes"
        :key="note._id"
      >
        <note-card
          :model="note"
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
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import NoteCard from '/imports/client/ui/properties/components/persona/NoteCard.vue';
import CreatureSummary from '/imports/client/ui/creature/character/CreatureSummary.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import tabFoldersMixin from '/imports/client/ui/properties/components/folders/tabFoldersMixin.js';

export default {
  components: {
    ColumnLayout,
    CreatureSummary,
    NoteCard,
  },
  mixins: [tabFoldersMixin],
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      tabName: 'journal',
    };
  },
  meteor: {
    notes(){
      const folderIds = CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'folder',
        groupStats: true,
        hideStatsGroup: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, { fields: { _id: 1 } }).map(folder => folder._id);
      
      return CreatureProperties.find({
        'ancestors.id': {
          $eq: this.creatureId,
        },
        'parent.id': {
          $nin: folderIds,
        },
        type: 'note',
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {order: 1},
      });
    },
    creature(){
      return Creatures.findOne(this.creatureId);
    },
  },
}
</script>

<style lang="css" scoped>

</style>