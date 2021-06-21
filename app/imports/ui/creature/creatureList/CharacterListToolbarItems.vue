<template lang="html">
  <div>
    {{ creatureCount }} /
    <v-icon v-if="characterSlots === -1">
      mdi-infinity
    </v-icon>
    <template v-else>
      {{ characterSlots }}
    </template>
    <v-btn
      icon
      data-id="open-archive-btn"
      @click="openArchive"
    >
      <v-icon>
        mdi-archive
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { getUserTier } from '/imports/api/users/patreon/tiers.js';

export default {
  meteor: {
    creatureCount(){
      return Creatures.find({owner: Meteor.userId()}).count();
    },
    characterSlots(){
      return getUserTier(Meteor.userId()).characterSlots;
    }
  },
  methods: {
    openArchive(){
      this.$store.commit('pushDialogStack', {
        component: 'archive-dialog',
        elementId: 'open-archive-btn',
      });
    }
  }
}
</script>

<style lang="css">
</style>
