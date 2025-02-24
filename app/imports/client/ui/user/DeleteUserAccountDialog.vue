<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      {{ $t('DeleteUserAccountDialog.K1g_WwnsJY0jxGUHv-dir') }}
    </v-toolbar-title>
    <div>
      <h2>{{ $t('DeleteUserAccountDialog.8_1aagUg0_82yQc6bbvh0') }}</h2>
      <v-alert
        :value="true"
        icon="mdi-alert"
        color="error"
        outlined
      >
        {{ $t('DeleteUserAccountDialog.mRk_m1E7isGvMZlg5MYRi') }}
      </v-alert>
      <p>{{ $t('DeleteUserAccountDialog.Okq6Nsc3PmT-cHSklg-5O') }}</p>
      <p>{{ $t('DeleteUserAccountDialog.w5qWIj3NYmaKm-_sc_I5n') }}</p>
      <template v-if="characters.length">
        <h3 v-if="characters.length > 1">
          {{ $t('DeleteUserAccountDialog.qmfJD9s12vzAb1-H9aKOe', [characters.length]) }}
        </h3>
        <h3 v-else>
          {{ $t('DeleteUserAccountDialog.t_qT3X6ZcdPYWJNNw_zzR') }}
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
          {{ $t('DeleteUserAccountDialog.SFAC1EqlY3krkcX62YN5u', [libraries.length]) }}
        </h3>
        <h3 v-else>
          {{ $t('DeleteUserAccountDialog.f3jPR5PASLEBBF48CqI4a') }}
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
          :label="$t('DeleteUserAccountDialog.eZGDM8P-zOzTQqdyxS7kU')"
          style="width: 350px;"
          :error-messages="usernameInputValid ? undefined : ' '"
          :append-icon="usernameInputValid ? 'mdi-check' : undefined"
        />
        <v-text-field
          v-model="verificationInput"
          :label="$t('DeleteUserAccountDialog.uCrG-R-63SnvzAhdU2on5')"
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
          {{ $t('DeleteUserAccountDialog.0JXz-C-9ZuiCDymS9b_kK') }}
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
        {{ $t('DeleteConfirmationDialog.7_oqaObBgI5fk_suDAZ0V') }}
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
      return input.toLowerCase() === this.$t('DeleteUserAccountDialog.vRIINpm1HCgWwkbyuEx73')
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
