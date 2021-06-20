<template>
  <div class="sidebar">
    <v-layout
      v-if="!signedIn"
      justify-center
    >
      <v-btn
        text
        to="/sign-in"
      >
        Sign in
      </v-btn>
    </v-layout>
    <v-list>
      <v-list-item v-if="signedIn">
        <v-list-item-content>
          <v-list-item-title>
            {{ userName }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-tooltip bottom>
            <template
              #activator="{ on }"
            >
              <v-btn
                icon
                to="/account"
                v-on="on"
              >
                <v-icon>mdi-cog</v-icon>
              </v-btn>
            </template>
            <span>Account Settings</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>

      <v-list-item
        v-for="(link, i) in links"
        :key="i"
        :to="link.to"
        :href="link.href"
      >
        <v-list-item-action>
          <v-icon>{{ link.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-title>
          {{ link.title }}
        </v-list-item-title>
        <v-icon v-if="link.href">
          mdi-open-in-new
        </v-icon>
      </v-list-item>
      <v-divider />
    </v-list>
    <v-list
      avatar
    >
      <v-list-item
        v-for="character in CreaturesWithNoParty"
        :key="character._id"
        :to="character.url"
      >
        <v-list-item-avatar :color="character.color || 'grey'">
          <img
            v-if="character.avatarPicture"
            :src="character.avatarPicture"
            :alt="character.name"
          >
          <template v-else>
            {{ character.initial }}
          </template>
        </v-list-item-avatar>
        <v-list-item-title>
          {{ character.name }}
        </v-list-item-title>
      </v-list-item>
      <!--
      <v-list-group
        v-for="party in parties"
        :key="party._id"
      >
        <v-list-item slot="activator">
          <v-list-item-title>
            {{ party.name }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-for="character in characterDocs"
          :key="character._id"
          :to="character.url"
        >
          <v-list-item-avatar :color="character.color || 'grey'">
            <img
              v-if="character.avatarPicture"
              :src="character.avatarPicture"
              :alt="character.name"
            >
            <template v-else>
              {{ character.initial }}
            </template>
          </v-list-item-avatar>
          <v-list-item-title>
            {{ character.name }}
          </v-list-item-title>
        </v-list-item>
      </v-list-group>
    -->
    </v-list>
  </div>
</template>

<script lang="js">
  import Creatures from '/imports/api/creature/Creatures.js';
  import Parties from '/imports/api/creature/creatureFolders/CreatureFolders.js';

  export default {
    meteor: {
      $subscribe: {
        'characterList': [],
      },
      signedIn(){
        return Meteor.userId();
      },
      userName(){
        let user = Meteor.user();
        return user && user.username || user && user._id;
      },
      links(){
        let isLoggedIn = !!Meteor.userId();
        let links = [
          {title: 'Home', icon: 'mdi-home', to: '/'},
          {title: 'Characters', icon: 'mdi-account-group', to: '/characterList', requireLogin: true},
          {title: 'Library', icon: 'mdi-library-shelves', to: '/library', requireLogin: true},
          //{title: 'Tabletops', icon: 'api', to: '/tabletops', requireLogin: true},
          //{title: 'Friends', icon: 'people', to: '/friends', requireLogin: true},
          {title: 'Feedback', icon: 'mdi-bug', to: '/feedback'},
          {title: 'About', icon: 'mdi-sign-text', to: '/about'},
          {title: 'Patreon', icon: 'mdi-patreon', href: 'https://www.patreon.com/dicecloud'},
          {title: 'Github', icon: 'mdi-github', href: 'https://github.com/ThaumRystra/DiceCloud/tree/version-2'},
        ];
        return links.filter(link => !link.requireLogin || isLoggedIn);
      },
      CreaturesWithNoParty() {
        var userId = Meteor.userId();
        var charArrays = Parties.find({owner: userId}).map(p => p.creatures);
        var partyChars = _.uniq(_.flatten(charArrays));
        return Creatures.find(
          {
            _id: {$nin: partyChars},
            $or: [{readers: userId}, {writers: userId}, {owner: userId}],
          },
          {sort: {name: 1}}
        ).map(char => {
          char.url = `/character/${char._id}/${char.urlName || '-'}`;
          char.initial = char.name && char.name[0] || '?';
          return char;
        });
      },
    },
  };
</script>
