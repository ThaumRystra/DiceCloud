<template>
  <toolbar-layout>
    <span slot="toolbar">
      Account
    </span>
    <v-layout align-center justify-center>
      <v-card class="ma-4 pa-2">
				<v-switch :input-value="darkMode" @change="setDarkMode" label="Dark mode"/>
        <v-list>
          <v-subheader>
            Username
          </v-subheader>
          <v-list-tile>
            <v-list-tile-title>
              {{user.username}}
            </v-list-tile-title>
            <v-list-tile-action>
              <v-tooltip left>
                <span>Change Username</span>
                <v-btn icon flat slot="activator">
                  <v-icon>create</v-icon>
                </v-btn>
              </v-tooltip>
            </v-list-tile-action>
          </v-list-tile>
          <v-subheader>
            Email
          </v-subheader>
          <v-list-tile v-for="email in emails" :key="email.address">
            <v-list-tile-title>
              {{email.address}}
            </v-list-tile-title>
            <v-list-tile-action>
              <v-tooltip left v-if="email.verified">
                <span>Verified</span>
                <v-icon slot="activator">assignment_turned_in</v-icon>
              </v-tooltip>
              <v-tooltip left v-else="email.verified">
                <span>Verify Account</span>
                <v-btn
                  flat
                  icon
                  slot="activator"
                  @click="verifyEmail(email.address)"
                >
                  <v-icon>assignment_late</v-icon>
                </v-btn>
              </v-tooltip>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-action>
              <v-tooltip right>
                <span>Add email address</span>
                <v-btn flat icon slot="activator">
                  <v-icon>add</v-icon>
                </v-btn>
              </v-tooltip>
            </v-list-tile-action>
          </v-list-tile>
          <v-subheader>
            API Key
          </v-subheader>
          <v-list-tile v-if="user.apiKey">
            <v-list-tile v-if="showApiKey">
              {{user.apiKey}}
            </v-list-tile>
            <v-list-tile-title v-else="showApiKey">
              {{"•".repeat(user.apiKey.length)}}
            </v-list-tile-title>
            <v-list-tile-action>
              <v-btn flat icon @click="showApiKey=!showApiKey">
                <v-icon>{{showApiKey ? 'visibility_off' : 'visibility'}}</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
          <v-list-tile v-else="user.apiKey">
            <v-btn flat color="accent" @click="generateKey">
              Generate API Key
            </v-btn>
          </v-list-tile>
          <v-subheader>
            Google Account
          </v-subheader>
          <v-list-tile v-if="googleAccount">
            <v-list-tile-avatar>
              <img src="googleAccount.picture">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>
                {{googleAccount.name}}
              </v-list-tile-title>
              <v-list-tile-sub-title>
                {{googleAccount.email}}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile v-else="googleAccount">
            <v-btn flat color="accent">
              Connect Google
            </v-btn>
          </v-list-tile>
        </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="accent">
            Sign Out
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </toolbar-layout>
</template>

<script>
  import ToolbarLayout from "/imports/ui/layouts/ToolbarLayout.vue";
  import { Accounts } from "meteor/accounts-base";
  import router from "/imports/ui/vueSetup.js";
  export default {
    meteor: {
      $subscribe: {
        "user": [],
      },
      user(){
        return Meteor.user();
      },
      googleAccount(){
        const user = Meteor.user();
        return user.services && user.services.google;
      },
      emails(){
        return Meteor.user().emails;
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
    methods: {
      signOut(){
        Meteor.logout(function (e) {

        });
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
    },
    components: {
      ToolbarLayout,
    },
  }
</script>
