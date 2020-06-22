<template>
  <div class="layout row justify-center">
    <v-card
      class="ma-4 pa-2"
      style="flex-basis: 900px"
    >
      <v-list>
        <v-list-tile>
          <smart-switch
            :value="darkMode"
            label="Dark mode"
            @change="setDarkMode"
          />
        </v-list-tile>
        <v-list-tile>
          <smart-switch
            label="Swap ability scores and modifiers"
            :value="
              user &&
                user.preferences &&
                user.preferences.swapAbilityScoresAndModifiers
            "
            @change="swapAbilityScoresAndModifiers"
          />
        </v-list-tile>

        <v-subheader>
          Username
        </v-subheader>
        <v-list-tile data-id="username">
          <v-list-tile-action>
            <v-tooltip right>
              <span>Change Username</span>
              <v-btn
                slot="activator"
                icon
                flat
                @click="changeUsername"
              >
                <v-icon>create</v-icon>
              </v-btn>
            </v-tooltip>
          </v-list-tile-action>
          <v-list-tile-title>
            {{ user && user.username }}
          </v-list-tile-title>
        </v-list-tile>

        <v-subheader>
          Email
        </v-subheader>
        <v-list-tile
          v-for="email in emails"
          :key="email.address"
        >
          <v-list-tile-title>
            {{ email.address }}
          </v-list-tile-title>
        </v-list-tile>
        <v-subheader>
          Patreon
        </v-subheader>
        <v-list-tile>
          <v-list-tile-title>
            Tier: {{ tier.name }}
          </v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-if="!user.services.google">
          <v-btn
            color="primary"
            @click="linkWithGoogle"
          >
            Link Google Account
          </v-btn>
        </v-list-tile>
        <v-list-tile v-if="!user.services.patreon">
          <v-btn
            color="primary"
            @click="linkWithPatreon"
          >
            Link Patreon Account
          </v-btn>
        </v-list-tile>
      </v-list>
      <v-layout
        row
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
            <v-list-tile
              :key="invite._id"
              :data-id="invite._id"
              @click="clickInvite(invite)"
            >
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ invite.inviteeName || invite.invitee || 'Available' }}
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon>mail_outline</v-icon>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider
              :key="index"
            />
          </template>
        </v-list>
      </template>
    </v-card>
  </div>
</template>

<script>
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
        Meteor.linkWithGoogle(error => {
          if (error) console.error(error);
        });
      },
      linkWithPatreon,
    },
  }
</script>
