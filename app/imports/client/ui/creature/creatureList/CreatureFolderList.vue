<template lang="html">
  <v-list
    expand
    :nav="nav"
    :density="dense ? 'compact' : 'default'"
    class="creature-folder-list"
  >
    <creature-list
      :creatures="creatures"
      :selection="selection"
      :selected-creature="selectedCreature"
      :dense="dense"
      @creature-selected="id => $emit('creature-selected', id)"
    />
    <v-expansion-panels
      eager
      flat
      multiple
      variant="accordion"
    >
      <v-slide-x-transition
        group
        leave-absolute
      >
        <v-expansion-panel
          v-for="folder in folders"
          :key="folder._id"
          :density="dense ? 'compact' : 'default'"
          :value="folder._id"
        >
          <v-expansion-panel-title>
            <template v-slot:default="{ expanded }">
              <creature-folder-header
                :open="expanded"
                :model="folder"
                :selection="selection"
                :dense="dense"
              />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <creature-list
              :creatures="folder.creatures"
              :folder-id="folder._id"
              :selection="selection"
              :selected-creature="selectedCreature"
              :dense="dense"
              @creature-selected="id => $emit('creature-selected', id)"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-slide-x-transition>
    </v-expansion-panels>
  </v-list>
</template>

<script
  setup
  lang="ts"
>
import { ref } from 'vue';
import CreatureFolderHeader from '/imports/client/ui/creature/creatureList/CreatureFolderHeader.vue';
import CreatureList from '/imports/client/ui/creature/creatureList/CreatureList.vue';

const props = defineProps<{
  creatures?: any[];
  folders?: any[];
  selection?: boolean;
  selectedCreature?: string;
  dense?: boolean;
  nav?: boolean;
}>();

defineEmits<{ (e: 'creature-selected', id: string): void }>();

const openFolders = ref<Record<string, boolean>>({});
</script>

<style lang="css">
.creature-folder-list .v-list-item__icon.v-list-group__header__append-icon {
  margin-left: 0 !important;
}
</style>
