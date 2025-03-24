<template>
  <v-fade-transition mode="out-in">
    <div
      v-if="!$subReady.singleCharacter"
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
      :creature-id="$route.params.id"
    />
  </v-fade-transition>
</template>

<script lang="js">
import CharacterSheet from '/imports/client/ui/creature/character/CharacterSheet.vue';
export default {
  components: {
    CharacterSheet,
  },
  meteor: {
    $subscribe: {
      'singleCharacter'() {
        return [this.$route.params.id];
      },
    },
  }
}
</script>
