<template>
  <ToolbarLayout>
    <v-expansion-panel popout class="ma-2">
      <!--No party-->
      <v-expansion-panel-content
        v-if="charactersWithNoParty.length"
      >
        <div slot="header">Characters</div>
        <v-card>
          <v-list>
            <v-list-tile
              v-for="character in charactersWithNoParty"
              :key="character._id"
              :href="character.url"
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
              <v-list-tile-title>
                {{character.name}}
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-expansion-panel-content>
      <!--Parties-->
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
    <v-speed-dial fixed bottom right>
      <v-btn
        slot="activator"
        fab
      >
        <v-icon>add</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
      <div>
        <span class="v-tooltip__content">New Character</span>
        <v-btn fab small slot="activator">
          <v-icon>group</v-icon>
        </v-btn>
      </div>
      <div>
        <span>New Party</span>
        <v-btn fab small slot="activator">
          <v-icon>group</v-icon>
        </v-btn>
      </div>
    </v-speed-dial>
  </ToolbarLayout>
</template>

<script>
  import ToolbarLayout from "/imports/ui/layouts/ToolbarLayout.vue";
  const characterTransform = function(char){
    char.url = `\/character\/${char._id}\/${char.urlName || "-"}`;
    char.color = getColorClass(char.color);
    char.initial = char.name[0] || "?";
    return char;
  };
  export default {
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
            }
      		).map(characterTransform);
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
    		).map(characterTransform);
    	},
    },
    components: {
      ToolbarLayout,
    }
  };
</script>
