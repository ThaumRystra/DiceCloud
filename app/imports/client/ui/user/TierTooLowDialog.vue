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
      <div
        class="d-flex"
      >
        <v-btn
          href="https://www.patreon.com/join/dicecloud/"
          color="accent"
          class="ma-4"
          target="_blank"
        >
          Join now
        </v-btn>
        <template v-if="!user.services.patreon">
          <v-btn
            color="primary"
            class="ma-4"
            @click="linkWithPatreon"
          >
            Link Patreon Account
          </v-btn>
        </template>
      </div>
    </v-layout>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      @click="$store.dispatch('popDialogStack')"
    >
      Cancel
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import TIERS, { getUserTier } from '/imports/api/users/patreon/tiers';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import linkWithPatreon from '/imports/api/users/methods/linkWithPatreon'

export default {
  components: {
    DialogBase,
  },
  data(){return {
    linkPatreonError: '',
  }},
  meteor: {
    tier(){
      let user = Meteor.user();
      if (!user) return TIERS[0];
      return getUserTier(user);
    },
    user(){
      return Meteor.user();
    },
  },
  methods: {
    linkWithPatreon(){
      this.linkPatreonError = '';
      linkWithPatreon(error => {
        if (error) {
          this.linkPatreonError = error;
        } else {
          Meteor.call('updateMyPatreonDetails', error => {
            if (error) this.linkPatreonError = error;
          });
        }
      });
    },
  }
}
</script>
