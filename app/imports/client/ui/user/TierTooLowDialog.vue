<template lang="html">
  <dialog-base>
    <div
      class="d-flex flex-column align-center justify-center"
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
    </div>
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import TIERS, { getUserTier } from '/imports/api/users/patreon/tiers';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import linkWithPatreon from '/imports/api/users/methods/linkWithPatreon';

const linkPatreonError = ref('');

const { result: tier } = autorun(() => {
  const user = Meteor.user();
  if (!user) return TIERS[0];
  return getUserTier(user);
});

const { result: user } = autorun(() => Meteor.user());

async function linkWithPatreonFn() {
  linkPatreonError.value = '';
  linkWithPatreon(async (error: any) => {
    if (error) {
      linkPatreonError.value = error;
    } else {
      try {
        await Meteor.callAsync('updateMyPatreonDetails');
      } catch (e: any) {
        linkPatreonError.value = e;
      }
    }
  });
}
</script>
