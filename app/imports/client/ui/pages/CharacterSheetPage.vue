<template>
  <character-sheet
    show-menu-button
    :creature-id="$route.params.id"
  />
</template>

<script lang="js">
import CharacterSheet from '/imports/client/ui/creature/character/CharacterSheet.vue';
export default {
  components: {
    CharacterSheet,
  },
}
</script>
