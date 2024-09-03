<template>
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Import character 
    </v-toolbar-title>
    <div>
      <h2 class="mb-4">
        Import a character from another instance of DiceCloud
      </h2>
      <p>
        The character needs to have their sharing permission set to "anyone can view"
      </p>
      <text-field
        :value="currentUrl"
        :error-messages="importError"
        @change="setUrl"
      />
      <div class="d-flex justify-center">
        <v-slide-x-transition>
          <v-btn
            v-show="characterData"
            :loading="loadingImportCharacter"
            color="primary"
            @click="importCharacterData"
          >
            Import
          </v-btn>
        </v-slide-x-transition>
      </div>
    </div>
    <template slot="actions">
      <v-btn
        text
        @click="$emit('pop')"
      >
        Cancel
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import importCharacterFromDiceCloudInstance from '/imports/api/creature/creatures/methods/importCharacterFromDiceCloudInstance'

export default {
  components: {
    DialogBase,
  },
  data(){return {
    loadingImportCharacter: false,
    importError: undefined,
    currentUrl: '',
    characterData: undefined,
  }},
  computed: {
    biographyAlert() {
      if (!this.name) return 'Name required';
      return undefined;
    }
  },
  meteor: {
    $subscribe: {
      'libraries': [],
    },
  },
  methods: {
    async setUrl(val, ack) {
      const regex = /(https?:\/\/)([\w|.]+)\/character\/([^/]+)\/(.+)/;
      if (!regex.test(val)) {
        ack('Not a valid character URL');
        return;
      }
      const newUrl = val.replace(regex, '$1$2/api/creature/$3');
      let characterData = undefined;
      this.importError = undefined;
      try {
        const res = await fetch(newUrl);
        characterData = await res.json();
      } catch (e) {
        ack(e);
        return;
      }
      if (characterData.error) {
        if (characterData.reason === 'No user ID. Are you logged in?') {
          ack('This character\'s sharing settings are not set to allow anyone to view')
        } else {
          ack(characterData.reason ?? characterData.error);
        }
        return;
      }
      this.characterData = characterData
      this.currentUrl = val;
      ack();
    },
    async importCharacterData() {
      this.loadingImportCharacter = true;
      importCharacterFromDiceCloudInstance.call({
        characterData: this.characterData
      }, (error, characterId) => {
        this.loadingImportCharacter = false;
        if (error) {
          this.importError = error.reason || error.message || error.toString();
          return;
        }
        this.$emit('pop', characterId);
      });
    },
      
  },
};
</script>

<style scoped>

</style>
