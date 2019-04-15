<template>
  <character-sheet show-menu-button :char-id="$route.params.id" />
</template>

<script>
import CharacterSheet from '/imports/ui/creature/character/CharacterSheet.vue';
export default {
	components: {
		CharacterSheet,
	},
}
</script>
