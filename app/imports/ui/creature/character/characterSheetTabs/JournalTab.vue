<template>
  <div class="build-tab">
    <column-layout wide-columns>
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
    </column-layout>
  </div>
</template>

<script lang="js">
import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import Slots from '/imports/ui/creature/slots/Slots.vue';
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import NoteCard from '/imports/ui/properties/components/persona/NoteCard.vue';
import CreatureSummary from '/imports/ui/creature/character/CreatureSummary.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';

export default {
  components: {
    ColumnLayout,
    CreatureSummary,
    NoteCard,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  meteor: {
    notes(){
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
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