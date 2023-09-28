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
        :is-selected="selected.includes(creature._id)"
        selection
        @click="toggleSelect(creature._id)"
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
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureListTile from '/imports/client/ui/creature/creatureList/CreatureListTile.vue';

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
    selected: [],
  }},
  meteor: {
    creatures(){
      return Creatures.find({_id: {$nin: this.startingSelection}});
    },
  },
  methods: {
    toggleSelect(id){
      const index = this.selected.indexOf(id);
      if (index === -1){
        this.selected.push(id);
      } else {
        this.selected.splice(index, 1);
      }
    },
  }
}
</script>

<style lang="css" scoped>
</style>
