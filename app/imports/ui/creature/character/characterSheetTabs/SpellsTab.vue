<template lang="html">
  <div class="spells">
    <column-layout wide-columns>
      <div v-if="spellsWithoutList.length">
        <v-card>
          <spell-list
            :spells="spellsWithoutList"
            :parent-ref="{id: creatureId, collection: 'creatures'}"
          />
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
import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import SpellListCard from '/imports/ui/properties/components/spells/SpellListCard.vue';
import SpellList from '/imports/ui/properties/components/spells/SpellList.vue';

export default {
	components: {
		ColumnLayout,
    SpellList,
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
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'spellList',
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {order: 1}
      });
		},
    spellsWithoutList(){
      return CreatureProperties.find({
        'ancestors.id': {
          $eq: this.creatureId,
          $nin: this.spellListIds,
        },
        type: 'spell',
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {
          level: 1,
          order: 1,
        }
      });
    },
		spellListsWithoutAncestorSpellLists(){
      return CreatureProperties.find({
        'ancestors.id': {
          $eq: this.creatureId,
          $nin: this.spellListIds,
        },
        type: 'spellList',
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {order: 1}
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
