<template>
  <div>
    <v-card class="ma-4">
      <v-list v-if="CreaturesWithNoParty.length">
        <creature-list-tile
          v-for="character in CreaturesWithNoParty"
          :key="character._id"
          :to="character.url"
          :model="character"
        />
      </v-list>
      <v-expansion-panel popout>
        <v-expansion-panel-content
          v-for="party in parties"
          :key="party._id"
        >
          <div slot="header">
            {{ party.name }}
          </div>
          <v-card>
            <v-list>
              <v-list-tile
                v-for="character in party.characterDocs"
                :key="character._id"
              >
                <v-list-tile-avatar>
                  <img
                    :src="character.picture"
                    alt="character.name"
                  >
                </v-list-tile-avatar>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-card>
    <v-btn
      color="accent"
      fab
      fixed
      bottom
      right
      data-id="new-character-button"
      @click="insertCharacter"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <!--
    <v-speed-dial
      v-model="fab"
      fixed
      bottom
      right
      transition="slide-y-reverse-transition"
    >
      <v-btn
        slot="activator"
        v-model="fab"
        color="accent"
        fab
      >
        <v-icon>add</v-icon>
        <v-icon>close</v-icon>
      </v-btn>
      <labeled-fab
        icon="face"
        label="New Character"
        data-id="new-character-button"
        @click="insertCharacter"
      />
      <labeled-fab
        icon="group"
        label="New Party"
      />
    </v-speed-dial>
    -->
  </div>
</template>

<script>
  import Creatures, {insertCreature} from '/imports/api/creature/Creatures.js';
  import Parties from '/imports/api/creature/Parties.js';
  import LabeledFab from '/imports/ui/components/LabeledFab.vue';
  import { getUserTier } from '/imports/api/users/patreon/tiers.js';
  import CreatureListTile from '/imports/ui/creature/CreatureListTile.vue';

  const characterTransform = function(char){
    char.url = `/character/${char._id}/${char.urlName || '-'}`;
    char.initial = char.name && char.name[0] || '?';
    return char;
  };
  export default {
    components: {
      LabeledFab,
      CreatureListTile,
    },
    data(){ return{
      fab: false,
    }},
    meteor: {
      $subscribe: {
        'characterList': [],
      },
      parties(){
        const userId = Meteor.userId();
        let parties =  Parties.find(
          {owner: userId},
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
        return parties;
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
        let tier = getUserTier(Meteor.userId());
        if (tier.paidBenefits){
          insertCreature.call((error, result) => {
            if (error){
              console.error(error);
            } else {
              this.$store.commit(
                'setTabForCharacterSheet',
                {id: result, tab: 4}
              );
              this.$store.commit('setShowBuildDialog', true);
              this.$router.push({ path: `/character/${result}`});
            }
          });
        } else {
          this.$store.commit('pushDialogStack', {
            component: 'tier-too-low-dialog',
            elementId: 'new-character-button',
          });
        }
      },
    }
  };
</script>
