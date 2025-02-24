<template>
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        {{ creature && creature.name }}
      </v-toolbar-title>
    </template>
    <template #unwrapped-content>
      <character-sheet
        show-menu-button
        embedded
        :creature-id="creatureId"
      />
    </template>
    <v-bottom-navigation
      slot="actions"
      shift
      mandatory
      class="bottom-nav-btns"
      style="position: relative;"
      :value="$store.getters.tabById(creatureId)"
      @change="e => $store.commit(
        'setTabForCharacterSheet',
        {id: creatureId, tab: e}
      )"
    >
      <v-btn>
        <span>{{ $t('CharacterSheetDialog.NnBUF4ZwE2sxY2H9laU5t') }}</span>
        <v-icon>mdi-chart-box</v-icon>
      </v-btn>
      <v-btn>
        <span>{{ $t('CharacterSheetDialog.uEahuOj2R9wGkNQ-mmdBa') }}</span>
        <v-icon>mdi-lightning-bolt</v-icon>
      </v-btn>
      <v-btn v-if="!creature.settings.hideSpellsTab">
        <span>{{ $t('CharacterSheetDialog.D7iHe3wbPaZ2Jhsn9CXU8') }}</span>
        <v-icon>mdi-fire</v-icon>
      </v-btn>
      <v-btn>
        <span>{{ $t('CharacterSheetDialog.0E9n7NRcJsKcvSOh8pJGk') }}</span>
        <v-icon>mdi-cube</v-icon>
      </v-btn>
      <v-btn>
        <span>{{ $t('CharacterSheetDialog.7PhUWMOg_8wLLCCY7CKDz') }}</span>
        <v-icon>mdi-text</v-icon>
      </v-btn>
      <v-btn>
        <span>{{ $t('CharacterSheetDialog.KOKK1cNcrY6O64cRo8aKa') }}</span>
        <v-icon>mdi-book-open-variant</v-icon>
      </v-btn>
      <v-btn>
        <span>{{ $t('CharacterSheetDialog.biA0vlRWylo6EW8GckGOx') }}</span>
        <v-icon>mdi-wrench</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import CharacterSheet from '/imports/client/ui/creature/character/CharacterSheet.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';

export default {
	components: {
    DialogBase,
		CharacterSheet,
	},
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  meteor: {
    creature() {
      if (!this.creatureId) return;
      return Creatures.findOne(this.creatureId);
    },
  },
}
</script>

<style lang="css" scoped>
.bottom-nav-btns {
  margin: -8px;
  box-shadow: none !important;
  flex-grow: 1;
  max-width: unset !important;
}
.bottom-nav-btns > .v-btn{
  min-width: 0 !important;
  padding: 0 !important;
  flex: 1 1 auto !important;
  font-size: 0.6rem !important;
}
</style>
