<template>
  <div
    class="card-background pa-4"
    style="height: 100%"
  >
    <v-card>
      <v-list v-if="CreaturesWithNoParty.length">
        <creature-list-tile
          v-for="character in CreaturesWithNoParty"
          :key="character._id"
          :to="character.url"
          :model="character"
        />
      </v-list>
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
  </div>
</template>

<script lang="js">
  import Creatures, {insertCreature} from '/imports/api/creature/Creatures.js';
  import Parties from '/imports/api/creature/Parties.js';
  import { getUserTier } from '/imports/api/users/patreon/tiers.js';
  import CreatureListTile from '/imports/ui/creature/CreatureListTile.vue';

  const characterTransform = function(char){
    char.url = `/character/${char._id}/${char.urlName || '-'}`;
    char.initial = char.name && char.name[0] || '?';
    return char;
  };
  export default {
    components: {
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
              this.$store.commit('setShowDetailsDialog', true);
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
