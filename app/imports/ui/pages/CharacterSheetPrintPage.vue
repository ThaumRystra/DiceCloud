<template>
  <character-sheet-print
    :creature-id="$route.params.id"
  />
</template>

<script lang="js">
import CharacterSheetPrint from '/imports/ui/creature/character/CharacterSheetPrint.vue';
export default {
	components: {
		CharacterSheetPrint,
	},
}
</script>
