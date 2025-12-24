<template>
  <div>
    <v-layout
      column
      align-center
      justify-center
    >
      <h2 style="margin: 48px 28px 16px">
        {{ $t('patreonLevelTooLow.currentTier') }} {{ tier.name }}
      </h2>
      <h3>
        {{ $t('patreonLevelTooLow.description') }}
      </h3>
      <v-btn
        href="https://www.patreon.com/join/dicecloud/checkout?rid=3002853"
        color="accent"
      >
        {{ $t('patreonLevelTooLow.joinNow') }}
      </v-btn>
    </v-layout>
  </div>
</template>

<script lang="js">
import TIERS, { getUserTier } from '/imports/api/users/patreon/tiers';

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
