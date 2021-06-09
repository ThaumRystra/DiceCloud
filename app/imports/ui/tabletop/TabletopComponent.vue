<template lang="html">
  <div class="tabletop">
    <section class="initiative-row layout center">
      <tabletop-creature-card
        v-for="creature in creatures"
        :key="creature._id"
        :model="creature"
      />
      <v-card
        class="layout column justify-center align-center"
        style="height: 162px; width: 100px;"
        data-id="select-creatures"
        hover
        @click="addCreature"
      >
        <div class="flex layout justify-center align-center">
          <v-icon>add</v-icon>
        </div>
        <v-card-title>
          Add creature
        </v-card-title>
      </v-card>
    </section>
    <section class="play-area">
      <tabletop-map />
      <tabletop-log :tabletop-id="model._id" />
    </section>
    <section class="action-row">
      <mini-character-sheet />
      <tabletop-action-cards />
    </section>
  </div>
</template>

<script lang="js">
import { addCreaturesToTabletop } from '/imports/api/tabletop/Tabletops.js';

import TabletopCreatureCard from '/imports/ui/tabletop/TabletopCreatureCard.vue';
import TabletopMap from '/imports/ui/tabletop/TabletopMap.vue';
import TabletopLog from '/imports/ui/tabletop/TabletopLog.vue';
import Creatures from '/imports/api/creature/Creatures.js';
import TabletopActionCards from '/imports/ui/tabletop/TabletopActionCards.vue';
import MiniCharacterSheet from '/imports/ui/creature/character/MiniCharacterSheet.vue';

export default {
  components: {
    TabletopCreatureCard,
    TabletopMap,
    TabletopLog,
    TabletopActionCards,
    MiniCharacterSheet,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data(){ return {
    activeCreature: undefined,
  }},
  meteor: {
    $subscribe:{
      'tabletop'(){
        return [this.model._id];
      },
    },
    creatures(){
      return Creatures.find({tabletop: this.model._id});
    },
  },
  methods: {
    addCreature(){
      this.$store.commit('pushDialogStack', {
				component: 'select-creatures-dialog',
				elementId: 'select-creatures',
        data: {
          startingSelection: this.creatures.map(c => c._id),
        },
        callback: (characterSet) => {
          if (!characterSet) return;
          addCreaturesToTabletop.call({
            tabletopId: this.model._id,
            creatureIds: Array.from(characterSet),
          });
        },
			});
    }
  }
}
</script>

<style lang="css" scoped>
.initiative-row > .v-card {
  flex-grow: 0;
  height: 162px;
  width: 100px;
  margin: 4px;
}
</style>
