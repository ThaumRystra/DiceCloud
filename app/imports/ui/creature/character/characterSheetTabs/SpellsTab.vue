<template lang="html">
  <div class="spells">
    <column-layout>
      <div>
        <v-card>
          <v-card-text>
            <v-switch
              v-model="organize"
              label="Organize"
              class="justify-end"
            />
            <creature-properties-tree
              :root="{collection: 'creatures', id: creatureId}"
              :filter="{
                equipped: {$ne: true},
                type: 'spell',
                'ancestors.id': {$nin: spellListIds}
              }"
              :organize="organize"
              group="spells"
              @selected="e => clickProperty(e)"
            />
          </v-card-text>
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
import SpellListCard from '/imports/ui/properties/components/spells/SpellListCard.vue';

export default {
	components: {
		ColumnLayout,
		CreaturePropertiesTree,
		SpellListCard,
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
			}, {
				sort: {order: 1},
			});
		},
		spellListsWithoutAncestorSpellLists(){
			return CreatureProperties.find({
				'ancestors.id': {
					$eq: this.creatureId,
					$nin: this.spellListIds
				},
				type: 'spellList',
				removed: {$ne: true},
			}, {
				sort: {order: 1},
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
				elementId: `tree-node-${_id}`,
				data: {_id},
			});
		},
	},
}
</script>

<style lang="css" scoped>
</style>
