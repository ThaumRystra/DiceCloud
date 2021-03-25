<template>
  <div class="layout justify-center">
    <v-card
      class="ma-4 pa-2"
      style="flex-basis: 900px"
    >
      <v-list>
        <v-subheader>
          Preferences
        </v-subheader>
        <v-list-item>
          <smart-switch
            :value="darkMode"
            label="Dark mode"
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
                  <v-icon>create</v-icon>
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
          <v-list-item-title>
            {{ email.address }}
          </v-list-item-title>
        </v-list-item>
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
                  <v-icon>refresh</v-icon>
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
                <v-icon>mail_outline</v-icon>
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
  import router from '/imports/ui/router.js';
  import getEntitledCents from '/imports/api/users/patreon/getEntitledCents.js';
  import Invites from '/imports/api/users/Invites.js';
  import linkWithPatreon from '/imports/api/users/linkWithPatreon.js'
  import { getUserTier } from '/imports/api/users/patreon/tiers.js';

  export default {
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
    }},
    computed: {
      entitledCents(){
        return getEntitledCents(this.user);
      },
      tier(){
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
      signOut(){
        Meteor.logout();
        router.push('/');
      },
      setDarkMode(value, ack){
        Meteor.users.setDarkMode.call({darkMode: !!value}, ack);
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
