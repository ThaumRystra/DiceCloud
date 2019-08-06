<template>
  <div class="sidebar">
		<v-toolbar color="secondary" dark>
			<v-layout row align-center v-if="signedIn">
				{{userName}}
				<v-spacer></v-spacer>
				<v-tooltip bottom>
					<v-btn flat icon slot="activator" to="/account"><v-icon>settings</v-icon></v-btn>
					<span>Account Settings</span>
				</v-tooltip>
			</v-layout>
			<v-layout row justify-center v-else="signedIn">
				<v-btn flat to="/sign-in">Sign in</v-btn>
			</v-layout>
		</v-toolbar>
    <v-list>
      <v-list-tile
        v-for="(link, i) in links"
				v-if="link.vif || link.vif === undefined"
        :to="link.to"
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
        v-for="character in CreaturesWithNoParty"
        :to="character.url"
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
          :to="character.url"
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
	import Creatures from '/imports/api/creature/Creatures.js';
	import Parties from '/imports/api/campaign/Parties.js';

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
				let links = [
					{title: "Home", icon: "home", to: "/"},
	        {title: "Creatures", icon: "group", to: "/characterList", vif: Meteor.userId()},
					{title: "Libraries", icon: "book", to: "/library", vif: Meteor.userId()},
	        {title: "Send Feedback", icon: "bug_report", to: "/feedback"},
	        {title: "Patreon", icon: "", href: "https://www.patreon.com/dicecloud"},
	        {title: "Github", icon: "", href: "https://github.com/ThaumRystra/DiceCloud/tree/version-2"},
				];
				if (Meteor.settings.public.showStorybook || Meteor.isDevelopment){
					links.push({title: 'Component Previews', icon: "category", to: '/storybook/HealthBar'})
				}
				return links;
			},
      parties(){
        let parties =  Parties.find(
    			{owner: Meteor.userId()},
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
            char.url = `\/character\/${char._id}\/${char.urlName || "-"}`;
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
          char.url = `\/character\/${char._id}\/${char.urlName || "-"}`;
          return char;
        });
    	},
    },
  };
</script>
