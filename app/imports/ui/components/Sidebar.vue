<template>
  <div class="sidebar">
		<v-toolbar color="primary" dark>
			<v-layout row align-center v-if="signedIn">
				{{userName}}
				<v-spacer></v-spacer>
				<v-tooltip bottom>
					<v-btn flat icon slot="activator"><v-icon>settings</v-icon></v-btn>
					<span>Account Settings</span>
				</v-tooltip>
			</v-layout>
			<v-layout row justify-center v-else="signedIn">
				<v-btn flat>Sign in</v-btn>
			</v-layout>
		</v-toolbar>
    <v-list>
      <v-list-tile
        v-for="(link, i) in links"
				v-if="link.vif || link.vif === undefined"
        :to="link.to"
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
    meteor: {
      $subscribe: {
        "characterList": [],
      },
			signedIn(){
				return Meteor.userId();
			},
			userName(){
				let user = Meteor.user();
				return user && user.username || user && user._id;
			},
			links(){
				return [
					{title: "Home", icon: "home", to: "/"},
	        {title: "Characters", icon: "group", to: "characterList", vif: Meteor.userId()},
	        {title: "Send Feedback", icon: "bug_report", to: "feedback"},
	        {title: "Patreon", icon: "", href: "https://www.patreon.com/dicecloud"},
	        {title: "Github", icon: "", href: "https://github.com/ThaumRystra/DiceCloud1"},
				];
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
