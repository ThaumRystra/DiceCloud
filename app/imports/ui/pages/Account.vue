<template>
  <div>
    <v-card class="ma-4 pa-2">
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
          <v-list-tile-title>
            {{ user && user.username }}
          </v-list-tile-title>
          <v-list-tile-action>
            <v-tooltip left>
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
          <v-list-tile-action>
            <v-tooltip
              v-if="email.verified"
              left
            >
              <span>Verified</span>
              <v-icon slot="activator">
                assignment_turned_in
              </v-icon>
            </v-tooltip>
            <v-tooltip left>
              <span>Verify Account</span>
              <v-btn
                slot="activator"
                flat
                icon
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
              <v-btn
                slot="activator"
                flat
                icon
              >
                <v-icon>add</v-icon>
              </v-btn>
            </v-tooltip>
          </v-list-tile-action>
        </v-list-tile>
        <v-subheader>
          API Key
        </v-subheader>
        <v-list-tile v-if="user && user.apiKey">
          <v-list-tile v-if="showApiKey">
            {{ user.apiKey }}
          </v-list-tile>
          <v-list-tile-title>
            {{ "•".repeat(user.apiKey.length) }}
          </v-list-tile-title>
          <v-list-tile-action>
            <v-btn
              flat
              icon
              @click="showApiKey=!showApiKey"
            >
              <v-icon>{{ showApiKey ? 'visibility_off' : 'visibility' }}</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile v-else>
          <v-btn
            flat
            color="accent"
            @click="generateKey"
          >
            Generate API Key
          </v-btn>
        </v-list-tile>
        <!--
        <v-subheader>
          Google Account
        </v-subheader>
        <v-list-tile v-if="googleAccount">
          <v-list-tile-avatar>
            <img src="googleAccount.picture">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ googleAccount.name }}
            </v-list-tile-title>
            <v-list-tile-sub-title>
              {{ googleAccount.email }}
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-else="googleAccount">
          <v-btn
            flat
            color="accent"
          >
            Connect Google
          </v-btn>
        </v-list-tile>
        -->
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
    },
  }
</script>
