<template>
  <div class="layout row justify-center">
    <v-card
      class="ma-4 pa-2"
      style="flex-basis: 900px"
    >
      <v-list>
        <v-list-tile>
          <v-switch
            :input-value="darkMode"
            label="Dark mode"
            @change="setDarkMode"
          />
        </v-list-tile>

        <v-subheader>
          Username
        </v-subheader>
        <v-list-tile>
          <v-list-tile-action>
            <v-tooltip right>
              <span>Change Username</span>
              <v-btn
                slot="activator"
                icon
                flat
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
        <template v-if="user.services.patreon">
          <v-list-tile>
            <v-list-tile-title>
              Pledged amount: ${{ entitledCents/100 }}
            </v-list-tile-title>
            <v-list-tile-action>
              <v-btn icon>
                <v-icon>refresh</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-title>
              Tier: {{ tier.name }}
            </v-list-tile-title>
          </v-list-tile>
        </template>
        <v-list-tile v-else>
          <v-btn @click="linkWithPatreon">
            Link Patreon
          </v-btn>
        </v-list-tile>
      </v-list>
      <v-card-actions>
        <v-spacer />
        <v-btn
          flat
          color="accent"
          @click="signOut"
        >
          Sign Out
        </v-btn>
      </v-card-actions>
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
        'user': [],
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
      signOut(){
        Meteor.logout();
        router.push('/');
      },
			setDarkMode(value){
				Meteor.users.setDarkMode.call({darkMode: !!value});
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
      linkWithPatreon,
    },
  }
</script>
