<template>
  <div>
    <v-layout
      column
      align-center
      justify-center
    >
      <h2 style="margin: 48px 28px 16px">
        {{ $t('PatreonLevelTooLow.dqCkVkcBD6EAc45E1C2bi', [tier.name]) }}
      </h2>
      <h3>
        {{ $t('PatreonLevelTooLow.-bIUc7XwwY0HD3HCkeQpG') }}
      </h3>
      <v-btn
        href="https://www.patreon.com/join/dicecloud/checkout?rid=3002853"
        color="accent"
      >
        {{ $t('PatreonLevelTooLow.MthXEAw6WyBg-N7IuQkiT') }}
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
