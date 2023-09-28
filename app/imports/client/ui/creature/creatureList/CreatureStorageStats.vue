<template>
  <div
    class="creature-storage-stats d-flex align-center"
    style="white-space: nowrap;"
  >
    <div>
      {{ creatureCount }} /
    </div>
    <v-icon v-if="characterSlots === -1">
      mdi-infinity
    </v-icon>
    <div v-else>
      {{ characterSlots }}
    </div>
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';
import { getUserTier } from '/imports/api/users/patreon/tiers';

export default {
  meteor: {
    creatureCount(){
      return Creatures.find({owner: Meteor.userId()}).count();
    },
    characterSlots(){
      return getUserTier(Meteor.userId()).characterSlots;
    }
  },
}
</script>

<style>

</style>