<template>
  <div
    class="card-background pa-4"
    style="height: 100%"
  >
    <v-card :class="{'mb-4': folders && folders.length}">
      <v-list v-if="CreaturesWithNoParty.length">
        <creature-list-tile
          v-for="creature in CreaturesWithNoParty"
          :key="creature._id"
          :to="creature.url"
          :model="creature"
        />
      </v-list>
    </v-card>
    <v-expansion-panels v-if="folders && folders.length">
      <v-expansion-panel
        v-for="folder in folders"
        :key="folder._id"
      >
        <v-expansion-panel-header>
          <template #default="{ open }">
            <div v-if="renamingFolder !== folder._id">
              {{ folder.name }}
            </div>
            <text-field
              v-else
              :ref="`name-input-${folder._id}`"
              regular
              hide-details
              dense
              :value="folder.name"
              @change="(value, ack) => renameFolder(folder._id, value, ack)"
              @click.native.stop="()=>{}"
            />
            <v-btn
              v-if="renamingFolder === folder._id || open"
              icon
              style="flex-grow: 0"
              @click.stop="renamingFolder !== folder._id ? renamingFolder = folder._id : renamingFolder = undefined"
            >
              <v-icon v-if="renamingFolder !== folder._id">
                mdi-pencil
              </v-icon>
              <v-icon v-else>
                mdi-check
              </v-icon>
            </v-btn>
            <v-btn
              v-if="open"
              icon
              style="flex-grow: 0"
              @click.stop="removeFolder(folder._id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list v-if="folder.creatures">
            <creature-list-tile
              v-for="creature in folder.creatures"
              :key="creature._id"
              :to="creature.url"
              :model="creature"
            />
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-btn
      text
      :loading="loadingInsertFolder"
      @click="insertFolder"
    >
      add folder
    </v-btn>
    <v-btn
      color="accent"
      fab
      fixed
      bottom
      right
      data-id="new-character-button"
      @click="insertCharacter"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script lang="js">
  import Vue from 'vue';
  import Creatures, {insertCreature} from '/imports/api/creature/Creatures.js';
  import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders.js';
  import { getUserTier } from '/imports/api/users/patreon/tiers.js';
  import CreatureListTile from '/imports/ui/creature/CreatureListTile.vue';
  import insertCreatureFolder from '/imports/api/creature/creatureFolders/methods.js/insertCreatureFolder.js';
  import updateCreatureFolderName from '/imports/api/creature/creatureFolders/methods.js/updateCreatureFolderName.js';
  import removeCreatureFolder from '/imports/api/creature/creatureFolders/methods.js/removeCreatureFolder.js';
  import {snackbar} from '/imports/ui/components/snackbars/SnackbarQueue.js';
  
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
      loadingInsertFolder: false,
      renamingFolder: undefined,
    }},
    meteor: {
      $subscribe: {
        'characterList': [],
      },
      folders(){
        const userId = Meteor.userId();
        let folders =  CreatureFolders.find(
          {owner: userId, archived: {$ne: true}},
          {sort: {order: 1}},
        ).map(folder => {
          folder.creatures = Creatures.find(
            {
              _id: {$in: folder.creatures || []},
              $or: [{readers: userId}, {writers: userId}, {owner: userId}],
            }, {
              sort: {name: 1},
            }
          ).map(characterTransform);
          return folder;
        });
        return folders;
      },
      CreaturesWithNoParty() {
        var userId = Meteor.userId();
        var charArrays = CreatureFolders.find({owner: userId}).map(p => p.creatures);
        var folderChars = _.uniq(_.flatten(charArrays));
        return Creatures.find(
          {
            _id: {$nin: folderChars},
            $or: [{readers: userId}, {writers: userId}, {owner: userId}],
          },
          {sort: {name: 1}}
        ).map(characterTransform);
      },
    },
    watch:{
      renamingFolder(newId){
        if(newId){
          Vue.nextTick(() => {
            let input = this.$refs[`name-input-${newId}`];
            input[0].focus();
          });
        }
      }
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
      insertFolder(){
        loadingInsertFolder = true;
        insertCreatureFolder.call(error => {
          loadingInsertFolder = false;
          if (!error) return;
          console.error(error);
          snackbar({
            text: error.reason,
          });
        });
      },
      renameFolder(_id, name, ack){
        updateCreatureFolderName.call({_id, name}, ack);
      },
      removeFolder(_id){
        removeCreatureFolder.call({_id}, error => {
          if (!error) return;
          console.error(error);
          snackbar({
            text: error.reason,
          });
        });
      },
    },
  };
</script>
