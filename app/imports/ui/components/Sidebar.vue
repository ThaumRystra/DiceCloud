<template>
  <div class="sidebar">
    <v-parallax src="/png/paper-dice-crown.png" height="140"></v-parallax>
    <v-list>
      <v-list-tile
        v-for="(link, i) in links"
        :href="link.href"
        :key="i"
      >
        <v-list-tile-action>
          <v-icon>{{link.icon}}</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>
          {{link.title}}
        </v-list-tile-title>
      </v-list-tile>
      <v-divider></v-divider>
    </v-list>
    <v-list dense>
      <v-list-tile
        v-for="character in charactersWithNoParty"
        :href="character.url"
        :key="character._id"
      >
        <v-list-tile-title>
          {{character.name}}
        </v-list-tile-title>
      </v-list-tile>
      <v-list-group
        v-for="party in parties"
        :key="party._id"
      >
        <v-list-tile slot="activator">
          <v-list-tile-title>
            {{party.name}}
          </v-list-tile-title>
        </v-list-tile>
        <v-list-tile
          v-for="character in characterDocs"
          :href="character.url"
          :key="character._id"
        >
          <v-list-tile-title>
            {{character.name}}
          </v-list-tile-title>
        </v-list-tile>
      </v-list-group>
    </v-list>
  </div>
</template>

<script>
  export default {
    data(){
      return {
        links: [
          {title: "Home", icon: "home", href: "/"},
          {title: "Characters", icon: "group", href: "/characterList"},
          {title: "Send Feedback", icon: "bug_report", href: "/feedback"},
          {title: "Patreon", icon: "", href: "https://www.patreon.com/dicecloud"},
          {title: "Github", icon: "", href: "https://github.com/ThaumRystra/DiceCloud1"},
        ],
      };
    },
    meteor: {
      $subscribe: {
        "characterList": [],
      },
      parties(){
        let parties =  Parties.find(
    			{owner: Meteor.userId()},
    			{sort: {name: 1}},
    		).map(party => {
          party.characterDocs = Characters.find(
      			{
      				_id: {$in: party.characters},
      				$or: [{readers: userId}, {writers: userId}, {owner: userId}],
      			}, {
              sort: {name: 1},
              fields: {name: 1, urlName: 1},
            }
      		).map(char => {
            char.url = `\/character\/${char._id}\/${char.urlName || "-"}`;
            return char;
          });
          return party;
        });
      },
    	charactersWithNoParty() {
    		var userId = Meteor.userId();
    		var charArrays = Parties.find({owner: userId}).map(p => p.characters);
    		var partyChars = _.uniq(_.flatten(charArrays));
    		return Characters.find(
    			{
    				_id: {$nin: partyChars},
    				$or: [{readers: userId}, {writers: userId}, {owner: userId}],
    			},
    			{sort: {name: 1}}
    		).map(char => {
          char.url = `\/character\/${char._id}\/${char.urlName || "-"}`;
          return char;
        });
    	},
    },
  };
</script>
