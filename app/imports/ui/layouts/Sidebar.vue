<template>
  <div class="sidebar">
    <v-alert
      icon="priority_high"
      type="error"
      dismissible
      :value="true"
    >
      This version of DiceCloud is in beta. Some data stored here may be destroyed by
      future updates.
    </v-alert>
    <v-layout
      v-if="!signedIn"
      row
      justify-center
    >
      <v-btn
        flat
        to="/sign-in"
      >
        Sign in
      </v-btn>
    </v-layout>
    <v-list>
      <v-list-tile v-if="signedIn">
        <v-list-tile-content>
          <v-list-tile-title>
            {{ userName }}
          </v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-tooltip bottom>
            <v-btn
              slot="activator"
              flat
              icon
              to="/account"
            >
              <v-icon>settings</v-icon>
            </v-btn>
            <span>Account Settings</span>
          </v-tooltip>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile
        v-for="(link, i) in links"
        :key="i"
        :to="link.to"
        :href="link.href"
      >
        <v-list-tile-action>
          <v-icon>{{ link.icon }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>
          {{ link.title }}
        </v-list-tile-title>
      </v-list-tile>
      <v-divider />
    </v-list>
    <v-list
      avatar
    >
      <v-list-tile
        v-for="character in CreaturesWithNoParty"
        :key="character._id"
        :to="character.url"
      >
        <v-list-tile-avatar :color="character.color || 'grey'">
          <img
            v-if="character.avatarPicture"
            :src="character.avatarPicture"
            :alt="character.name"
          >
          <template v-else>
            {{ character.initial }}
          </template>
        </v-list-tile-avatar>
        <v-list-tile-title>
          {{ character.name }}
        </v-list-tile-title>
      </v-list-tile>
      <v-list-group
        v-for="party in parties"
        :key="party._id"
      >
        <v-list-tile slot="activator">
          <v-list-tile-title>
            {{ party.name }}
          </v-list-tile-title>
        </v-list-tile>
        <v-list-tile
          v-for="character in characterDocs"
          :key="character._id"
          :to="character.url"
        >
          <v-list-tile-avatar :color="character.color || 'grey'">
            <img
              v-if="character.avatarPicture"
              :src="character.avatarPicture"
              :alt="character.name"
            >
            <template v-else>
              {{ character.initial }}
            </template>
          </v-list-tile-avatar>
          <v-list-tile-title>
            {{ character.name }}
          </v-list-tile-title>
        </v-list-tile>
      </v-list-group>
    </v-list>
  </div>
</template>

<script>
  import Creatures from '/imports/api/creature/Creatures.js';
  import Parties from '/imports/api/campaign/Parties.js';

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
          {title: 'Home', icon: 'home', to: '/'},
          {title: 'Characters', icon: 'portrait', to: '/characterList', requireLogin: true},
          {title: 'Library', icon: 'book', to: '/library', requireLogin: true},
          //{title: 'Friends', icon: 'people', to: '/friends', requireLogin: true},
          {title: 'Feedback', icon: 'bug_report', to: '/feedback'},
          {title: 'About', icon: 'subject', to: '/about'},
          {title: 'Patreon', icon: '', href: 'https://www.patreon.com/dicecloud'},
          {title: 'Github', icon: '', href: 'https://github.com/ThaumRystra/DiceCloud/tree/version-2'},
        ];
        return links.filter(link => !link.requireLogin || isLoggedIn);
      },
      parties(){
        const userId = Meteor.userId();
        return Parties.find(
          {owner: userId},
          {sort: {name: 1}},
        ).map(party => {
          party.characterDocs = Creatures.find(
            {
              _id: {$in: party.Creatures},
              $or: [{readers: userId}, {writers: userId}, {owner: userId}],
            }, {
              sort: {name: 1},
              fields: {name: 1, urlName: 1},
            }
          ).map(char => {
            char.url = `/character/${char._id}/${char.urlName || '-'}`;
            char.initial = char.name && char.name[0] || '?';
            return char;
          });
          return party;
        });
      },
      CreaturesWithNoParty() {
        var userId = Meteor.userId();
        var charArrays = Parties.find({owner: userId}).map(p => p.Creatures);
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
