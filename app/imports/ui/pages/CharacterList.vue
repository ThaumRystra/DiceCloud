<template>
  <toolbar-layout>
    <span slot="toolbar">Creatures</span>
    <v-card class="ma-4">
      <v-list v-if="CreaturesWithNoParty.length">
        <v-list-tile
          v-for="character in CreaturesWithNoParty"
          :key="character._id"
          :to="character.url"
        >
          <v-list-tile-avatar :color="character.color">
              <img
              v-if="character.picture"
              :src="character.picture"
              alt="character.name"
              >
              <template v-else>
                {{character.initial}}
              </template>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>
              {{character.name}}
            </v-list-tile-title>
            <v-list-tile-sub-title>
              {{character.alignment}} {{character.gender}} {{character.race}}
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-expansion-panel popout>
        <v-expansion-panel-content
          v-for="party in parties"
          :key="party._id"
        >
          <div slot="header">{{party.name}}</div>
          <v-card>
            <v-list>
              <v-list-tile
                v-for="character in party.characterDocs"
                :key="character._id"
              >
                <v-list-tile-avatar>
                  <img :src="character.picture" alt="character.name">
                </v-list-tile-avatar>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-card>
    <v-speed-dial
      fixed
      bottom
      right
      transition="slide-y-reverse-transition"
      v-model="fab"
    >
      <v-btn
        slot="activator"
        color="accent"
        fab
        v-model="fab"
      >
        <v-icon>add</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
      <labeled-fab icon="face" label="New Character" @click="insertCharacter"></labeled-fab>
      <labeled-fab icon="group" label="New Party"></labeled-fab>
    </v-speed-dial>
  </toolbar-layout>
</template>

<script>
	import Creatures from '/imports/api/creature/Creatures.js';
	import Parties from '/imports/api/campaign/Parties.js';
  import store from "/imports/ui/vuexStore.js";
  import ToolbarLayout from "/imports/ui/layouts/ToolbarLayout.vue";
  import LabeledFab from "/imports/ui/components/LabeledFab.vue";
  import CharacterCreationDialog from "/imports/ui/creature/character/CharacterCreationDialog.vue";
	import insertCreature from '/imports/api/creature/insertCreature.js';

  const characterTransform = function(char){
    char.url = `\/character\/${char._id}\/${char.urlName || "-"}`;
    char.initial = char.name[0] || "?";
    return char;
  };
  export default {
    data(){ return{
      fab: false,
    }},
    meteor: {
      $subscribe: {
        "characterList": [],
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
            }
      		).map(characterTransform);
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
    		).map(characterTransform);
    	},
    },
    methods: {
      insertCharacter(){
				insertCreature.call(result);
				
        /*
				store.commit("pushDialogStack", {
           component: CharacterCreationDialog,
           data: {},
           element: undefined,
           returnElement: undefined,
           callback(result){
						 if (!result) return;
             insertCreature.call(result);
           },
        });
				*/
      },
    },
    components: {
      ToolbarLayout,
      LabeledFab,
    }
  };
</script>
