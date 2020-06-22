<template lang="html">
  <toolbar-card
    :color="model.color"
    :data-id="model._id"
    @toolbarclick="clickSpellList(model._id)"
  >
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer />
    </template>
    <v-list
      two-line
      dense
    >
      <spell-list-tile
        v-for="spell in spells"
        :key="spell._id"
        :data-id="`spell-list-tile-${spell._id}`"
        :model="spell"
        @click="clickProperty(spell._id)"
      />
    </v-list>
  </toolbar-card>
</template>

<script>
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import SpellListTile from '/imports/ui/properties/components/spells/SpellListTile.vue';
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';

export default {
	components: {
		ToolbarCard,
    SpellListTile,
	},
	props: {
		model: Object,
		organize: Boolean,
	},
  meteor: {
    spells(){
      return getActiveProperties({
        ancestorId: this.model._id,
        filter: {
          type: 'spell',
        },
      });
    },
  },
	methods: {
		clickSpellList(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `${_id}`,
				data: {_id},
			});
		},
		clickProperty(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `spell-list-tile-${_id}`,
				data: {_id},
			});
		},
	}
};
</script>

<style lang="css" scoped>
</style>
