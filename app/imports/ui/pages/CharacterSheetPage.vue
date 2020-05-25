<template>
  <character-sheet
    show-menu-button
    :creature-id="$route.params.id"
    :tabs.sync="activeTab"
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
  computed: {
    activeTab: {
      get(){
        return this.tabs;
      },
      set(newTab){
        this.$emit('update:tabs', newTab);
      },
    },
  },
}
</script>
