<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        {{ mode === 'archive' ? 'Archive' : 'Restore' }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn-toggle
        v-model="mode"
        mandatory
      >
        <v-btn value="archive">
          <span>Archive</span>
          <v-icon right>
            mdi-archive-arrow-down
          </v-icon>
        </v-btn>
        <v-btn value="restore">
          <span>Restore</span>
          <v-icon right>
            mdi-archive-arrow-up-outline
          </v-icon>
        </v-btn>
      </v-btn-toggle>
    </template>
    <creature-folder-list
      selection
      :creatures="mode === 'archive' ? CreaturesWithNoParty : archiveCreaturesWithNoParty"
      :folders="mode === 'archive' ? folders : archivefolders"
      :selected-creature="selectedCreature"
      @creature-selected="id => selectedCreature = id"
    />
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      :loading="archiveActionLoading"
      :disabled="!numSelected"
      color="primary"
      @click="archiveAction"
    >
      {{ mode === 'archive' ? 'Archive' : 'Restore' }}
      <template v-if="numSelected > 1">
        {{ numSelected }} characters
      </template>
      <template v-else-if="numSelected === 1">
        character
      </template>
    </v-btn>
    <v-btn
      slot="actions"
      text
      @click="$store.dispatch('popDialogStack')"
    >
      Close
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import ArchivedCreatures from '/imports/api/creature/archive/ArchivedCreatures.js';
import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders.js';
import CreatureFolderList from '/imports/ui/creature/creatureList/CreatureFolderList.vue';
import archiveCreatures from '/imports/api/creature/archive/methods/archiveCreatures.js';
import restoreCreatures from '/imports/api/creature/archive/methods/restoreCreatures.js';
import {snackbar} from '/imports/ui/components/snackbars/SnackbarQueue.js';

const characterTransform = function(char){
  char.url = `/character/${char._id}/${char.urlName || '-'}`;
  char.initial = char.name && char.name[0] || '?';
  return char;
};

const creatureFields = {
  'color': 1,
  'avatarPicture': 1,
  'name': 1,
  'initial': 1,
  'alignment': 1,
  'gender': 1,
  'race': 1,
  'readers': 1,
  'writers': 1,
  'owner': 1,
};

export default {
  components: {
    DialogBase,
    CreatureFolderList,
  },
  data(){return {
    selectedCreature: null,
    mode: 'archive',
    archiveActionLoading: false,
  }},
  computed: {
    numSelected(){
      return this.selectedCreature ? 1 : 0;
    },
  },
  watch: {
    mode(){
      this.selectedCreature = null;
    },
  },
  methods: {
    archiveAction(){
      if (!this.selectedCreature) return;
      this.archiveActionLoading = true;
      if (this.mode === 'archive'){
        archiveCreatures.call({
          creatureIds: [this.selectedCreature],
        }, error => {
          this.archiveActionLoading = false;
          if (!error) return;
          console.error(error);
          snackbar({text: error.reason});
        });
      } else if (this.mode === 'restore'){
        let archiveId = ArchivedCreatures.findOne({
          'creature._id': this.selectedCreature
        })._id;
        restoreCreatures.call({
          archiveIds: [archiveId],
        }, error => {
          this.archiveActionLoading = false;
          if (!error) return;
          console.error(error);
          snackbar({text: error.reason});
        });
      }
      this.selectedCreature = null;
    }
  },
  meteor: {
    $subscribe: {
      'archivedCreatures': [],
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
            owner: userId,
          }, {
            sort: {name: 1},
            fields: creatureFields,
          }
        ).map(characterTransform);
        return folder;
      });
      folders = folders.filter(folder => !!folder.creatures.length);
      return folders;
    },
    CreaturesWithNoParty() {
      var userId = Meteor.userId();
      var charArrays = CreatureFolders.find({owner: userId}).map(p => p.creatures);
      var folderChars = _.uniq(_.flatten(charArrays));
      return Creatures.find(
        {
          _id: {$nin: folderChars},
          owner: userId,
        }, {
          sort: {name: 1},
          fields: creatureFields,
        }
      ).map(characterTransform);
    },
    archivefolders(){
      const userId = Meteor.userId();
      let folders =  CreatureFolders.find(
        {owner: userId},
        {sort: {order: 1}},
      ).map(folder => {
        folder.creatures = ArchivedCreatures.find(
          {
            'creature._id': {$in: folder.creatures || []},
            owner: userId,
          }, {
            sort: {'creature.name': 1},
            fields: {creature: 1},
          }
        ).map(arc => characterTransform(arc.creature));
        return folder;
      });
      folders = folders.filter(folder => !!folder.creatures.length);
      return folders;
    },
    archiveCreaturesWithNoParty() {
      var userId = Meteor.userId();
      var charArrays = CreatureFolders.find({owner: userId}).map(p => p.creatures);
      var folderChars = _.uniq(_.flatten(charArrays));
      return ArchivedCreatures.find(
        {
          'creature._id': {$nin: folderChars},
          owner: userId,
        }, {
          sort: {'creature.name': 1},
          fields: {creature: 1},
        }
      ).map(arc => characterTransform(arc.creature));
    },
  }
}
</script>

<style lang="css" scoped>
</style>
