<template>
  <dialog-base>
    <template #toolbar-extension>
      <v-tabs
        v-if="creature && creature.settings"
        :value="$store.getters.tabById(creatureId)"
        :color="$vuetify.theme.themes.dark.primary" 
        class="flex"
        style="min-width: 0"
        centered
        grow
        max="100px"
        @change="e => $store.commit(
          'setTabForCharacterSheet',
          {id: creatureId, tab: e}
        )"
      >
        <v-tab>
          Stats
        </v-tab>
        <v-tab>
          Actions
        </v-tab>
        <v-tab v-if="!creature.settings.hideSpellsTab">
          Spells
        </v-tab>
        <v-tab>
          Inventory
        </v-tab>
        <v-tab>
          Features
        </v-tab>
        <v-tab>
          Journal
        </v-tab>
        <v-tab>
          Build
        </v-tab>
        <v-tab v-if="creature.settings.showTreeTab">
          Tree
        </v-tab>
      </v-tabs>
    </template>
    <template #unwrapped-content>
      <character-sheet
        show-menu-button
        embedded
        :creature-id="creatureId"
      />
    </template>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import CharacterSheet from '/imports/client/ui/creature/character/CharacterSheet.vue';
import Creatures from '/imports/api/creature/creatures/Creatures.js';

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
  // @ts-ignore
  meteor: {
    creature() {
      if (!this.creatureId) return;
      return Creatures.findOne(this.creatureId);
    },
  },
  data(){return {
    tab: 0,
  }},
}
</script>
