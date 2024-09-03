<template>
  <div
    class="card-background"
    style="height: 100%"
  >
    <v-container>
      <v-row
        justify="center"
        class="mb-16"
      >
        <v-col
          cols="12"
          xl="8"
        >
          <v-alert
            v-if="characterSpaceLeft < 0"
            type="error"
          >
            You have exceeded your maximum number of character slots, archive or delete
            some characters.
          </v-alert>
          <v-alert
            v-else-if="characterSpaceLeft === 0"
            type="info"
          >
            You have hit your maximum number of characters.
            <archive-button
              small
              text
              class="mx-2"
            />
            or
            <v-btn
              href="https://www.patreon.com/join/dicecloud/"
              class="mx-2"
              target="_blank"
              small
              text
            >
              Increase Patreon tier
              <v-icon right>
                mdi-patreon
              </v-icon>
            </v-btn>
          </v-alert>
          <v-card :class="{ 'mb-4': folders && folders.length }">
            <creature-folder-list
              :creatures="CreaturesWithNoParty"
              :folders="folders"
            />
          </v-card>
          <div class="layout justify-end mt-2">
            <v-btn
              v-if="showImportButton"
              text
              data-id="import-character-button"
              @click="importCharacter"
            >
              import character
            </v-btn>
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
            :disabled="characterSpaceLeft <= 0"
            @click="insertCharacter"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders';
import { getUserTier } from '/imports/api/users/patreon/tiers';
import insertCreatureFolder from '/imports/api/creature/creatureFolders/methods.js/insertCreatureFolder';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import CreatureFolderList from '/imports/client/ui/creature/creatureList/CreatureFolderList.vue';
import ArchiveButton from '/imports/client/ui/creature/creatureList/ArchiveButton.vue';
import getCreatureUrlName from '/imports/api/creature/creatures/getCreatureUrlName';
import { uniq, flatten } from 'lodash';

const characterTransform = function (char) {
  char.url = `/character/${char._id}/${getCreatureUrlName(char)}`;
  char.initial = char.name && char.name[0] || '?';
  return char;
};
export default {
  components: {
    CreatureFolderList,
    ArchiveButton,
  },
  data() {
    return {
      fab: false,
      loadingInsertFolder: false,
      renamingFolder: undefined,
    }
  },
  meteor: {
    $subscribe: {
      'characterList': [],
    },
    folders() {
      const userId = Meteor.userId();
      let folders = CreatureFolders.find(
        { owner: userId, archived: { $ne: true } },
        { sort: { name: 1 } },
      ).map(folder => {
        folder.creatures = Creatures.find(
          {
            _id: { $in: folder.creatures || [] },
            $or: [{ readers: userId }, { writers: userId }, { owner: userId }],
          }, {
          sort: { name: 1 },
        }
        ).map(characterTransform);
        return folder;
      });
      return folders;
    },
    CreaturesWithNoParty() {
      var userId = Meteor.userId();
      var charArrays = CreatureFolders.find({ owner: userId }).map(p => p.creatures);
      var folderChars = uniq(flatten(charArrays));
      return Creatures.find(
        {
          _id: { $nin: folderChars },
          $or: [{ readers: userId }, { writers: userId }, { owner: userId }],
        },
        { sort: { name: 1 } }
      ).map(characterTransform);
    },
    creatureCount() {
      let userId = Meteor.userId();
      return Creatures.find({
        owner: userId,
      }, {
        fields: { _id: 1 },
      }).count();
    },
    tier() {
      let userId = Meteor.userId();
      return getUserTier(userId);
    },
    characterSpaceLeft() {
      let tier = this.tier;
      let currentCharacterCount = this.creatureCount;
      if (tier.characterSlots === -1) return Number.POSITIVE_INFINITY;
      return tier.characterSlots - currentCharacterCount
    },
    exceededCharacterSpace() {
      let tier = this.tier;
      let currentCharacterCount = this.creatureCount;
      return tier.characterSlots !== -1 && currentCharacterCount > tier.characterSlots
    },
    showImportButton() {
      return !Meteor.settings.public?.disallowCreatureApiImport;
    }
  },
  methods: {
    insertCharacter() {
      const self = this;
      self.$store.commit('pushDialogStack', {
        component: 'character-creation-dialog',
        elementId: 'new-character-button',
        callback: creatureId => creatureId,
      });
    },
    importCharacter() {
      const self = this;
      self.$store.commit('pushDialogStack', {
        component: 'character-import-dialog',
        elementId: 'import-character-button',
        callback: creatureId => creatureId,
      });
    },
    insertFolder() {
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
  },
};
</script>
