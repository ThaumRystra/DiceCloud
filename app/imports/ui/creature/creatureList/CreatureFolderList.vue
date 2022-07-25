<template lang="html">
  <v-list
    expand
    class="creature-folder-list"
  >
    <creature-list
      :creatures="creatures"
      :selection="selection"
      :selected-creature="selectedCreature"
      :dense="dense"
      @creature-selected="id => $emit('creature-selected', id)"
    />
    <v-list-group
      v-for="folder in folders"
      :key="folder._id"
      v-model="openFolders[folder._id]"
      group="folder"
    >
      <template #activator>
        <creature-folder-header
          :open="openFolders[folder._id]"
          :model="folder"
          :selection="selection"
          :dense="dense"
        />
      </template>
      <creature-list
        :creatures="folder.creatures"
        :folder-id="folder._id"
        :selection="selection"
        :selected-creature="selectedCreature"
        :dense="dense"
        @creature-selected="id => $emit('creature-selected', id)"
      />
    </v-list-group>
  </v-list>
</template>

<script lang="js">
import CreatureFolderHeader from '/imports/ui/creature/creatureList/CreatureFolderHeader.vue';
import CreatureList from '/imports/ui/creature/creatureList/CreatureList.vue';

export default {
  components: {
    CreatureFolderHeader,
    CreatureList,
  },
  props:{
    creatures: {
      type: Array,
      default: () => [],
    },
    folders: {
      type: Array,
      default: () => [],
    },
    selection: Boolean,
    selectedCreature: {
      type: String,
      default: undefined,
    },
    dense: Boolean,
  },
  data(){return{
    openFolders: {},
  }},
}
</script>

<style lang="css">
.creature-folder-list .v-list-item__icon.v-list-group__header__append-icon {
  margin-left: 0 !important;
}
</style>
