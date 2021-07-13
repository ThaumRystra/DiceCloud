<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Add Characters
    </v-toolbar-title>
    <v-list>
      <p v-if="!creatures.length">
        There are no creatures to add or you have already added them all
      </p>
      <creature-list-tile
        v-for="creature in creatures"
        :key="creature._id"
        :model="creature"
        :selected="selected"
        selection
        @select="toggleSelect(creature._id)"
      />
    </v-list>
    <template slot="actions">
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="$store.dispatch('popDialogStack', selected)"
      >
        Add characters
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureListTile from '/imports/ui/creature/creatureList/CreatureListTile.vue';

export default {
  components: {
    DialogBase,
    CreatureListTile,
  },
  props: {
    startingSelection: {
      type: Array,
      default: () => [],
    },
  },
  data(){return {
    selected: new Set(),
  }},
  meteor: {
    creatures(){
      return Creatures.find({_id: {$nin: this.startingSelection}});
    },
  },
  methods: {
    toggleSelect(id){
      let hadId = this.selected.delete(id);
      if (!hadId) this.selected.add(id);
    },
  }
}
</script>

<style lang="css" scoped>
</style>
