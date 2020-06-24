<template lang="html">
  <div class="spells">
    <column-layout wide-columns>
      <div v-if="spellsWithoutList.length">
        <v-card>
          <v-list
            two-line
            dense
          >
            <spell-list-tile
              v-for="spell in spellsWithoutList"
              :key="spell._id"
              :data-id="`spell-list-tile-${spell._id}`"
              :model="spell"
              @click="clickProperty(spell._id)"
            />
          </v-list>
        </v-card>
      </div>
      <div
        v-for="spellList in spellListsWithoutAncestorSpellLists"
        :key="spellList._id"
      >
        <spellList-card
          :model="spellList"
          :organize="organize"
        />
      </div>
    </column-layout>
  </div>
</template>

<script>
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
import CreaturePropertiesTree from '/imports/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';
import SpellListCard from '/imports/ui/properties/components/spells/SpellListCard.vue';
import SpellListTile from '/imports/ui/properties/components/spells/SpellListTile.vue';

export default {
	components: {
		ColumnLayout,
		CreaturePropertiesTree,
    SpellListTile,
		SpellListCard,
	},
  inject: {
    context: { default: {} }
  },
	props: {
		creatureId: {
      type: String,
      required: true,
    }
	},
	data(){ return {
		organize: false,
	}},
	meteor: {
		spellLists(){
      return getActiveProperties({
        ancestorId: this.creatureId,
        filter: {
          type: 'spellList',
        },
      });
		},
    spellsWithoutList(){
      return getActiveProperties({
        ancestorId: this.creatureId,
        excludeAncestors: this.spellListIds,
        filter: {
          type: 'spell',
        },
      });
    },
		spellListsWithoutAncestorSpellLists(){
      return getActiveProperties({
        ancestorId: this.creatureId,
        excludeAncestors: this.spellListIds,
        filter: {
          type: 'spellList',
        },
      });
		},
	},
	computed: {
		spellListIds(){
			return this.spellLists.map(spellList => spellList._id);
		},
	},
	methods: {
		clickProperty(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `spell-list-tile-${_id}`,
				data: {_id},
			});
		},
	},
}
</script>

<style lang="css" scoped>
</style>
