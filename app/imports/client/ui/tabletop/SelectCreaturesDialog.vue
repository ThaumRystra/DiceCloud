<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      {{ $t('SelectCreaturesDialog.ooUpaVf3Q6Kb-Ot1Kc0k0') }}
    </v-toolbar-title>
    <v-list>
      <p v-if="!creatures.length">
        {{ $t('SelectCreaturesDialog.UjUpHVRYzvCyqwNi7DV2w') }}
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
        {{ $t('SelectCreaturesDialog.gnUhOrXXmGGPWI9kQbpHI') }}
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
