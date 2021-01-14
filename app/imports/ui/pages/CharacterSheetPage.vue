<template>
  <character-sheet
    show-menu-button
    :creature-id="$route.params.id"
  />
</template>

<script>
import CharacterSheet from '/imports/ui/creature/character/CharacterSheet.vue';
export default {
	components: {
		CharacterSheet,
	},
}
</script>
