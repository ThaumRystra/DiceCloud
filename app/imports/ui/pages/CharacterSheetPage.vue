<template>
  <character-sheet
    show-menu-button
    :creature-id="$route.params.id"
    :tabs="tabs"
  />
</template>

<script>
import CharacterSheet from '/imports/ui/creature/character/CharacterSheet.vue';
export default {
	components: {
		CharacterSheet,
	},
  props: {
    tabs: {
      type: Number,
      required: true,
    },
  },
}
</script>
