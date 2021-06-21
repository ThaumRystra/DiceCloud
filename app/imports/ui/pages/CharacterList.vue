<template>
  <div
    class="card-background pa-4"
    style="height: 100%"
  >
    <v-card :class="{'mb-4': folders && folders.length}">
      <creature-list :creatures="CreaturesWithNoParty" />
    </v-card>
    <v-expansion-panels
      v-if="folders && folders.length"
      multiple
    >
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
          <creature-list
            :creatures="folder.creatures"
            :folder-id="folder._id"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <div class="layout justify-end mt-2">
      <v-btn
        text
        :loading="loadingInsertFolder"
        @click="insertFolder"
      >
        add folder
      </v-btn>
    </div>
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
  import Creatures from '/imports/api/creature/creatures/Creatures.js';
  import insertCreature from '/imports/api/creature/creatures/methods/insertCreature.js';
  import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders.js';
  import CreatureList from '/imports/ui/creature/creatureList/CreatureList.vue';
  import { getUserTier } from '/imports/api/users/patreon/tiers.js';
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
      CreatureList,
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
        this.loadingInsertFolder = true;
        insertCreatureFolder.call(error => {
          this.loadingInsertFolder = false;
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
