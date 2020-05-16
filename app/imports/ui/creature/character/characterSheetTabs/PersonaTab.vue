<template lang="html">
  <div class="inventory">
    <column-layout wide-columns>
      <div>
        <v-card
          hover
          data-id="creature-summary"
          @click="showCharacterForm"
        >
          <v-img
            v-if="creature.picture"
            :src="creature.picture"
          />
          <v-card-title class="title">
            {{ creature.name }}
          </v-card-title>
          <v-card-text>
            {{ creature.alignment }}<br>
            {{ creature.gender }}
          </v-card-text>
        </v-card>
      </div>
      <div
        v-for="note in notes"
        :key="note._id"
      >
        <note-card
          :model="note"
        />
      </div>
    </column-layout>
  </div>
</template>

<script>
import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
import NoteCard from '/imports/ui/properties/components/persona/NoteCard.vue';

export default {
	components: {
		ColumnLayout,
		NoteCard,
	},
	props: {
		creatureId: String,
	},
	meteor: {
		notes(){
			return CreatureProperties.find({
				'ancestors.id': this.creatureId,
				type: 'note',
				removed: {$ne: true},
			}, {
				sort: {order: 1},
			});
		},
		creature(){
			return Creatures.findOne(this.creatureId);
		}
	},
	methods: {
		showCharacterForm(){
			this.$store.commit('pushDialogStack', {
				component: 'creature-form-dialog',
				elementId: 'creature-summary',
				data: {
					_id: this.creatureId,
				},
			});
		},
	},
};
</script>

<style lang="css" scoped>
</style>
