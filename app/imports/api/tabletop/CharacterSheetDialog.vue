<template>
  <dialog-base>
    <template #replace-toolbar>
      <v-tabs
        v-if="creature && creature.settings"
        v-model="tab"
        :color="$vuetify.theme.themes.dark.primary"
      >
        <v-tab>
          Stats
        </v-tab>
        <v-tab>
          Features
        </v-tab>
        <v-tab>
          Inventory
        </v-tab>
        <v-tab v-if="!creature.settings.hideSpellsTab">
          Spells
        </v-tab>
        <v-tab>
          Character
        </v-tab>
        <v-tab v-if="creature.settings.showTreeTab">
          Tree
        </v-tab>
      </v-tabs>
    </template>
    <character-sheet
      show-menu-button
      :creature-id="creatureId"
    />
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import CharacterSheet from '/imports/client/ui/creature/character/CharacterSheet.vue';

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
  data(){return {
    tab: 0,
  }},
}
</script>
