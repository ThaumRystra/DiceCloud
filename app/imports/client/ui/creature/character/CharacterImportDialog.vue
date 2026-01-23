<template>
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      {{ $t('creature.character.characterImportDialog.title') }}
    </v-toolbar-title>
    <div>
      <h2 class="mb-4">
        {{ $t('creature.character.characterImportDialog.importCharacter') }}
      </h2>
      <p>
        {{ $t('creature.character.characterImportDialog.importCharacterDescription') }}
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
            {{ $t('creature.character.characterImportDialog.import') }}
          </v-btn>
        </v-slide-x-transition>
      </div>
    </div>
    <template slot="actions">
      <v-btn
        text
        @click="$emit('pop')"
      >
        {{ $t('creature.character.characterImportDialog.cancel') }}
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
        if (characterData.reason === this.$t('creature.character.characterImportDialog.errors.noUserId')) {
          ack(this.$t('creature.character.characterImportDialog.errors.ackNoUserId'))
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
