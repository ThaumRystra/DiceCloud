<template>
  <v-fade-transition mode="out-in">
    <div
      v-if="!characterReady"
      key="character-loading"
      class="fill-height layout justify-center align-center"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      />
    </div>
    <character-sheet
      v-else
      show-menu-button
      :creature-id="route.params.id"
    />
  </v-fade-transition>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { subscribe } from 'vue-meteor-tracker';
import CharacterSheet from '/imports/client/ui/creature/character/CharacterSheet.vue';

const route = useRoute();
const { ready: characterReady } = subscribe(() => ['singleCharacter', route.params.id as string]);
</script>
