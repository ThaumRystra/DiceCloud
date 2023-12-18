<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Delete User Account
    </v-toolbar-title>
    <div>
      <h2>Are you sure you want to delete your account?</h2>
      <v-alert
        :value="true"
        icon="mdi-alert"
        color="error"
        outlined
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
      <v-layout
        column
        align-start
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
      </v-layout>
    </div>
    <div
      slot="actions"
      class="layout justify-end"
    >
      <v-btn
        text
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
    </div>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';
import Libraries from '/imports/api/library/Libraries';
import CreatureListTile from '/imports/client/ui/creature/creatureList/CreatureListTile.vue';

export default {
  components: {
    DialogBase,
    CreatureListTile,
  },
  data() {
    return {
      usernameInput: '',
      verificationInput: '',
    };
  },
  meteor: {
    $subscribe: {
      'ownedDocuments'() {
        return [];
      },
    },
    characters() {
      return Creatures.find({ owner: Meteor.userId() });
    },
    libraries() {
      return Libraries.find({ owner: Meteor.userId() });
    },
    user() {
      return Meteor.user();
    },
  },
  computed: {
    usernameInputValid() {
      let username = this.user.username;
      if (!username) return true;
      let input = this.usernameInput;
      if (!input) return false;
      if (input.toLowerCase() === username.toLowerCase()) {
        return true;
      } else {
        return false;
      }
    },
    verificationInputValid() {
      let input = this.verificationInput || '';
      return input.toLowerCase() === 'delete my account'
    },
    valid() {
      return this.usernameInputValid && this.verificationInputValid;
    }
  },
  methods: {
    deleteAccount() {
      this.$router.push('/');
      Meteor.users.deleteMyAccount.call();
      this.$store.dispatch('popDialogStack');
    },
  },
}
</script>

<style lang="css" scoped>

</style>
