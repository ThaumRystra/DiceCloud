<template>
  <div>
    <v-layout
      column
      align-center
      justify-center
    >
      <h2 style="margin: 48px 28px 16px">
        Your current Patreon tier is {{ tier.name }}
      </h2>
      <h3>
        You need to be at least Adventurer tier (or be invited by a Patron of
        a higher tier) to access this beta
      </h3>
    </v-layout>
  </div>
</template>

<script>
import TIERS, { getUserTier } from '/imports/api/users/patreon/tiers.js';

export default {
  meteor: {
    tier(){
      let user = Meteor.user();
      if (!user) return TIERS[0];
      return getUserTier(user);
    }
  },
}
</script>
