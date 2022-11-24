<template lang="html">
  <v-container
    class="tabletop"
    fluid
  >
    <v-row
      dense
      class="initiative-row"
      style="flex-wrap: nowrap; overflow-x: auto;"
    >
      <tabletop-creature-card
        v-for="creature in creatures"
        :key="creature._id"
        :model="creature"
      />
      <v-card
        class="layout column justify-center align-center"
        style="height: 150px; min-width: 120px;"
        data-id="select-creatures"
        hover
        @click="addCreature"
      >
        <div class="flex layout justify-center align-center">
          <v-icon>mdi-plus</v-icon>
        </div>
        <v-card-title>
          Add<br>creature
        </v-card-title>
      </v-card>
    </v-row>
    <tabletop-map class="play-area" />
    <section class="action-row">
      <mini-character-sheet />
      <tabletop-action-cards />
    </section>
  </v-container>
</template>

<script lang="js">
import addCreaturesToTabletop from '/imports/api/tabletop/methods/addCreaturesToTabletop.js';
import TabletopCreatureCard from '/imports/client/ui/tabletop/TabletopCreatureCard.vue';
import TabletopMap from '/imports/client/ui/tabletop/TabletopMap.vue';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import TabletopActionCards from '/imports/client/ui/tabletop/TabletopActionCards.vue';
import MiniCharacterSheet from '/imports/client/ui/creature/character/MiniCharacterSheet.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';

export default {
  components: {
    TabletopCreatureCard,
    TabletopMap,
    TabletopActionCards,
    MiniCharacterSheet,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeCreature: undefined,
    }
  },
  meteor: {
    $subscribe: {
      'tabletop'() {
        return [this.model._id];
      },
    },
    creatures() {
      return Creatures.find({ tabletop: this.model._id });
    },
  },
  methods: {
    addCreature() {
      this.$store.commit('pushDialogStack', {
        component: 'select-creatures-dialog',
        elementId: 'select-creatures',
        data: {
          startingSelection: this.creatures.map(c => c._id),
        },
        callback: (charIds) => {
          if (!charIds) return;
          addCreaturesToTabletop.call({
            tabletopId: this.model._id,
            creatureIds: charIds,
          }, error => {
            if (error) snackbar(error.message);
          });
        },
      });
    }
  }
}
</script>

<style lang="css" scoped>
.initiative-row>.v-card {
  flex-grow: 0;
  height: 162px;
  width: 100px;
  margin: 4px;
}
</style>
