<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import Creatures from '/imports/api/creature/creatures/Creatures';
import { getUserTierAsync } from '/imports/api/users/patreon/tiers';

const { result: creatureCount } = autorun(() =>
  Creatures.find({ owner: Meteor.userId() }).count()
);

const { result: characterSlots } = autorun(() =>
  getUserTierAsync(Meteor.userId()).characterSlots
);
</script>

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

<style>

</style>
