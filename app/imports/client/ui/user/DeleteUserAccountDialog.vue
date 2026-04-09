<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        Delete User Account
      </v-toolbar-title>
    </template>
    <div>
      <h2>Are you sure you want to delete your account?</h2>
      <v-alert
        :value="true"
        icon="mdi-alert"
        color="error"
        variant="outlined"
      >
        Deleted accounts can not be recovered
      </v-alert>
      <p>We will immediately delete your account and all of your data</p>
      <p>Your username will become available to anyone on DiceCloud</p>
      <template v-if="characters.length">
        <h3 v-if="characters.length > 1">
          These {{ characters.length }} characters will be deleted:
        </h3>
        <h3 v-else>
          This character will be deleted:
        </h3>
        <v-list>
          <creature-list-tile
            v-for="character in characters"
            :key="character._id"
            :model="character"
          />
        </v-list>
      </template>
      <template v-if="libraries.length">
        <h3 v-if="libraries.length > 1">
          These {{ libraries.length }} libraries will be deleted:
        </h3>
        <h3 v-else>
          This library will be deleted:
        </h3>
        <v-list>
          <creature-list-tile
            v-for="library in libraries"
            :key="library._id"
            :model="library"
          />
        </v-list>
      </template>
      <div
        class="d-flex flex-column align-start"
      >
        <v-text-field
          v-if="user.username"
          v-model="usernameInput"
          label="Type your username or email"
          style="width: 350px;"
          :error-messages="usernameInputValid ? undefined : ' '"
          :append-icon="usernameInputValid ? 'mdi-check' : undefined"
        />
        <v-text-field
          v-model="verificationInput"
          label="To verify type 'delete my account'"
          style="width: 350px;"
          :error-messages="verificationInputValid ? undefined : ' '"
          :append-icon="verificationInputValid ? 'mdi-check' : undefined"
        />
        <v-btn
          class="mt-4"
          color="error"
          :disabled="!valid"
          @click="deleteAccount"
        >
          Permanently delete account
        </v-btn>
      </div>
    </div>
    <template #actions>
      <div
        class="d-flex justify-end"
      >
        <v-btn
          variant="text"
          @click="$store.dispatch('popDialogStack')"
        >
          Cancel
        </v-btn>
      </div>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';
import Libraries from '/imports/api/library/Libraries';
import CreatureListTile from '/imports/client/ui/creature/creatureList/CreatureListTile.vue';

const store = useStore();
const router = useRouter();

const usernameInput = ref('');
const verificationInput = ref('');

autorun(() => Meteor.subscribe('ownedDocuments'));

const { result: characters } = autorun(() => Creatures.find({ owner: Meteor.userId() }));
const { result: libraries } = autorun(() => Libraries.find({ owner: Meteor.userId() }));
const { result: user } = autorun(() => Meteor.user());

const usernameInputValid = computed(() => {
  const username = user.value?.username;
  if (!username) return true;
  const input = usernameInput.value;
  if (!input) return false;
  return input.toLowerCase() === username.toLowerCase();
});

const verificationInputValid = computed(() =>
  (verificationInput.value || '').toLowerCase() === 'delete my account'
);

const valid = computed(() => usernameInputValid.value && verificationInputValid.value);

function deleteAccount() {
  router.push('/');
  Meteor.users.deleteMyAccount.callAsync();
  store.dispatch('popDialogStack');
}
</script>

<style lang="css" scoped>

</style>
