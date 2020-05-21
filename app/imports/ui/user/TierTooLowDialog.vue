<template lang="html">
  <dialog-base>
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
        a higher tier) to perform this action
      </h3>
      <v-btn
        href="https://www.patreon.com/join/dicecloud/checkout?rid=3002853"
        color="accent"
      >
        Join now
      </v-btn>
    </v-layout>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      flat
      @click="$store.dispatch('popDialogStack')"
    >
      Cancel
    </v-btn>
  </dialog-base>
</template>

<script>
import TIERS, { getUserTier } from '/imports/api/users/patreon/tiers.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';

export default {
  components: {
    DialogBase,
  },
  meteor: {
    tier(){
      let user = Meteor.user();
      if (!user) return TIERS[0];
      return getUserTier(user);
    }
  },
}
</script>
