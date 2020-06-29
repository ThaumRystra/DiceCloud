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
    <spell-list :spells="spells" />
  </toolbar-card>
</template>

<script>
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import SpellList from '/imports/ui/properties/components/spells/SpellList.vue';
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';

export default {
	components: {
		ToolbarCard,
    SpellList,
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
        options: {
          sort: {
            level: 1,
            order: 1,
          },
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
	}
};
</script>

<style lang="css" scoped>
</style>
