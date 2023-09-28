<template>
  <div
    class="layout justify-center card-background"
    style="height: 100%;"
  >
    <v-card
      class="ma-4 pa-2"
      style="flex-basis: 900px"
    >
      <v-list>
        <v-subheader>
          File storage used
        </v-subheader>
        <file-storage-stats />
        <v-subheader>
          Character storage used
        </v-subheader>
        <v-list-item>
          <v-list-item-title>
            <creature-storage-stats />
          </v-list-item-title>
        </v-list-item>
        <v-subheader class="mb-4">
          Preferences
        </v-subheader>
        <v-list-item>
          <smart-toggle
            label="Theme"
            :value="darkMode === true ? 'true' : darkMode === false ? 'false' : darkMode === null ? 'unset': undefined"
            :options="[
              {name: 'Dark', value: 'true', icon: 'mdi-brightness-5'},
              {name: 'Match device theme', value: 'unset'},
              {name: 'Light', value: 'false', icon: 'mdi-brightness-7'},
            ]"
            @change="setDarkMode"
          />
        </v-list-item>
        <v-list-item>
          <smart-switch
            label="Swap ability scores and modifiers"
            :value="
              user &&
                user.preferences &&
                user.preferences.swapAbilityScoresAndModifiers
            "
            @change="swapAbilityScoresAndModifiers"
          />
        </v-list-item>

        <v-subheader>
          Username
        </v-subheader>
        <v-list-item data-id="username">
          <v-list-item-action>
            <v-tooltip right>
              <template #activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  @click="changeUsername"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Change Username</span>
            </v-tooltip>
          </v-list-item-action>
          <v-list-item-title>
            {{ user && user.username }}
          </v-list-item-title>
        </v-list-item>

        <v-subheader>
          Email
        </v-subheader>
        <v-list-item
          v-for="email in emails"
          :key="email.address"
        >
          <v-list-item-action v-if="emails.length > 1">
            <v-btn
              icon
              small
              @click="removeEmail(email.address)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-title>
            {{ email.address }}
          </v-list-item-title>
        </v-list-item>
        <v-expand-transition>
          <v-alert
            v-if="removeEmailError"
            type="error"
          >
            {{ removeEmailError }}
          </v-alert>
        </v-expand-transition>
        <v-slide-x-transition
          hide-on-leave
        >
          <v-text-field
            v-if="showEmailInput"
            v-model="inputEmail"
            label="Add Email Address"
            :error-messages="addEmailError"
            outlined
          >
            <v-btn
              slot="prepend"
              icon
              @click="clearEmailInput"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-btn
              slot="append"
              icon
              @click="addEmail"
            >
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </v-text-field>
          <v-btn
            v-else-if="!emails || emails.length < 2"
            icon
            @click="showEmailInput = true"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-slide-x-transition>
        <v-subheader>
          Patreon
        </v-subheader>
        <v-list-item>
          <v-list-item-action>
            <v-tooltip right>
              <template #activator="{ on }">
                <v-btn
                  icon
                  :loading="updatePatreonLoading"
                  v-on="on"
                  @click="updatePatreon"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Refresh Patreon status</span>
            </v-tooltip>
          </v-list-item-action>
          <v-list-item-title>
            Tier: {{ tier.name }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item v-if="!user.services.google">
          <v-btn
            color="primary"
            @click="linkWithGoogle"
          >
            Link Google Account
          </v-btn>
        </v-list-item>
        <v-list-item v-if="!user.services.patreon">
          <v-btn
            color="primary"
            @click="linkWithPatreon"
          >
            Link Patreon Account
          </v-btn>
        </v-list-item>
      </v-list>
      <v-layout
        justify-end
      >
        <v-btn
          color="accent"
          @click="signOut"
        >
          Sign Out
        </v-btn>
      </v-layout>
      <template v-if="invites.length">
        <v-divider class="mt-3 mb-3" />
        <v-subheader>
          <h1>
            Invites
          </h1>
        </v-subheader>
        <v-list>
          <template
            v-for="(invite, index) in invites"
          >
            <v-list-item
              :key="invite._id"
              :data-id="invite._id"
              @click="clickInvite(invite)"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ invite.inviteeName || invite.invitee || 'Available' }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon>mdi-email-outline</v-icon>
              </v-list-item-action>
            </v-list-item>
            <v-divider
              :key="index"
            />
          </template>
        </v-list>
      </template>
      <v-layout
        justify-end
        class="mt-3"
      >
        <v-btn
          color="error"
          data-id="delete-account-btn"
          @click="deleteAccount"
        >
          Delete Account
        </v-btn>
      </v-layout>
    </v-card>
  </div>
</template>

<script lang="js">
  import router from '/imports/client/ui/router';
  import getEntitledCents from '/imports/api/users/patreon/getEntitledCents';
  import Invites from '/imports/api/users/Invites';
  import linkWithPatreon from '/imports/api/users/methods/linkWithPatreon'
  import { getUserTier } from '/imports/api/users/patreon/tiers';
  import addEmail from '/imports/api/users/methods/addEmail';
  import removeEmail from '/imports/api/users/methods/removeEmail';
  import CreatureStorageStats from '/imports/client/ui/creature/creatureList/CreatureStorageStats.vue';
  import FileStorageStats from '/imports/client/ui/files/FileStorageStats.vue';

  export default {
    components: {
      CreatureStorageStats,
      FileStorageStats,
    },
    meteor: {
      $subscribe: {
        'userPublicProfiles'(){
          if (!this.invites) return false;
          return [this.invites.map(i => i.invitee).filter(i => !!i)];
        },
      },
      user(){
        return Meteor.user();
      },
      googleAccount(){
        const user = Meteor.user();
        return user && user.services && user.services.google;
      },
      emails(){
        const user = Meteor.user();
        return user && user.emails;
      },
      darkMode(){
        return this.user && this.user.darkMode;
      },
      invites(){
        let usernames = {};
        Meteor.users.find({}).forEach(user => {
          usernames[user._id] = user.username;
        });
        return Invites.find({
          inviter: Meteor.userId(),
        }, {
          sort: {dateConfirmed: 1, invitee: -1},
        }).map(invite => {
          invite.inviteeName = usernames[invite.invitee];
          return invite;
        });
      },
    },
    data(){ return {
      showApiKey: false,
      signOutBusy: false,
      apiKeyGenerationError: null,
      emailVerificationError: null,
      linkGoogleError: '',
      linkPatreonError: '',
      updatePatreonError: '',
      updatePatreonLoading: false,
      // Add email
      showEmailInput: false,
      addEmailLoading: false,
      inputEmail: '',
      addEmailError: undefined,
      // Remove email
      removeEmailLoading: undefined,
      removeEmailError: undefined,
    }},
    computed: {
      entitledCents(){
        return getEntitledCents(this.user);
      },
      tier(){
        if (!this.user) return {};
        return getUserTier(this.user);
      },
    },
    methods: {
      changeUsername(){
        this.$store.commit('pushDialogStack', {
          component: 'username-dialog',
          elementId: 'username',
        });
      },
      clearEmailInput(){
        this.showEmailInput = false;
        this.addEmailError = undefined;
        this.inputEmail = '';
      },
      addEmail(){
        this.addEmailLoading = true;
        addEmail.call({email: this.inputEmail}, error => {
          this.addEmailError = error && error.message;
          this.addEmailLoading = false;
          if (!error){
            this.showEmailInput = false;
            this.inputEmail = '';
          }
        });
      },
      removeEmail(address){
        this.removeEmailLoading = address;
        removeEmail.call({email: address}, error => {
          this.removeEmailError = error && error.message;
          this.removeEmailLoading = undefined;
          if (!error){
            this.showEmailInput = false;
            this.inputEmail = '';
          }
        });
      },
      signOut(){
        Meteor.logout();
        router.push('/');
      },
      setDarkMode(value, ack) {
        let darkMode;
        if (value === 'true') {
          darkMode = true;
        } else if (value === 'false') {
          darkMode = false;
        } else if (value === 'unset') {
          darkMode = null;
        }
        Meteor.users.setDarkMode.call({darkMode}, ack);
      },
      swapAbilityScoresAndModifiers(value, ack){
        Meteor.users.setPreference.call({
          preference: 'swapAbilityScoresAndModifiers',
          value: !!value,
        }, ack);
      },
      generateKey(){
        Meteor.users.gnerateApiKey.call(error => {
          if(error) this.apiKeyGenerationError = error.reason;
        });
        this.showApiKey = true;
      },
      verifyEmail(address){
        Meteor.users.sendVerificationEmail.call({address}, error => {
          if(error) this.emailVerificationError = error.reason;
        });
      },
      clickInvite(invite){
        this.$store.commit('pushDialogStack', {
          component: 'invite-dialog',
          elementId: invite._id,
          data: {inviteId: invite._id},
        });
      },
      linkWithGoogle(){
        this.linkGoogleError = '';
        Meteor.linkWithGoogle(error => {
          if (error) this.linkGoogleError = error;
        });
      },
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
      updatePatreon(){
        this.updatePatreonLoading = true;
        this.updatePatreonError = '';
        Meteor.call('updateMyPatreonDetails', error => {
          this.updatePatreonLoading = false;
          if (error) this.updatePatreonError = error;
        });
      },
      deleteAccount(){
        this.$store.commit('pushDialogStack', {
          component: 'delete-user-account-dialog',
          elementId: 'delete-account-btn',
        });
      }
    },
  }
</script>
