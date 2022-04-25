<template lang="html">
  <div
    class="tabletop layout column"
    style="height: 100%;"
  >
    <tabletop-map
      class="play-area"
      style="
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    "
    />
    <v-container
      fluid
    >
      <v-row
        dense
        class="initiative-row flex-grow-0"
        style="flex-wrap: nowrap; overflow-x: auto;"
        @wheel="transformScroll($event)"
      >
        <tabletop-creature-card
          v-for="creature in creatures"
          :key="creature._id"
          :model="creature"
          :active="activeCreature === creature._id"
          :targeted="targets.includes(creature._id)"
          @click="activeCreature = creature._id; targets = []"
          @target="targets.push(creature._id)"
          @untarget="untarget(creature._id)"
        />
        <div
          class="layout column ma-1 flex-grow-0"
        >
          <v-btn
            data-id="select-creatures"
            class="mb-2"
            @click="addCreature"
          >
            <v-icon left>
              mdi-plus
            </v-icon>
            Add Character
          </v-btn>
          <v-btn disabled>
            <v-icon left>
              mdi-plus
            </v-icon>
            Add Creature
          </v-btn>
        </div>
      </v-row>
    </v-container>
    <v-footer
      inset
      class="pa-0"
      style="background: none; 
      box-shadow: none;
      position: absolute;
      left: 0; 
      bottom:0;
      right: 0;"
    >
      <v-container fluid>
        <v-row
          dense
          class="action-row"
          style="flex-wrap: nowrap; overflow-x: auto;"
          @wheel="transformScroll($event)"
        >
          <mini-character-sheet
            v-if="activeCreature"
            data-id="mini-character-sheet"
            @click="openCharacterSheetDialog"
          />
          <action-card
            v-for="action in actions"
            :key="action._id"
            :model="action"
            :data-id="action._id"
            :targets="targets"
            @click="clickProperty({_id: action._id})"
          />
        </v-row>
      </v-container>
    </v-footer>
  </div>
</template>

<script lang="js">
import addCreaturesToTabletop from '/imports/api/tabletop/methods/addCreaturesToTabletop.js';
import TabletopCreatureCard from '/imports/ui/tabletop/TabletopCreatureCard.vue';
import TabletopMap from '/imports/ui/tabletop/map/TabletopMap.vue';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import MiniCharacterSheet from '/imports/ui/creature/character/MiniCharacterSheet.vue';
import snackbar from '/imports/ui/components/snackbars/SnackbarQueue.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import ActionCard from '/imports/ui/properties/components/actions/ActionCard.vue';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';

function getProperties(ancestorId, type){
  if (!ancestorId) return [];
  return CreatureProperties.find({
    'ancestors.id': ancestorId,
    type,
    removed: {$ne: true},
    inactive: {$ne: true},
  }, {
    sort: {order: 1}
  });
}

export default {
  components: {
    TabletopCreatureCard,
    TabletopMap,
    ActionCard,
    MiniCharacterSheet,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  reactiveProvide: {
    name: 'context',
    include: ['editPermission'],
  },
  data(){ return {
    activeCreature: undefined,
    targets: [],
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
    actions(){
      return getProperties(this.activeCreature, 'action').map(a => {
        delete a.summary;
        return a;
      });
    },
    editPermission(){
      try {
        assertEditPermission(this.activeCreature, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
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
    },
    openCharacterSheetDialog(){
      this.$store.commit('pushDialogStack', {
				component: 'character-sheet-dialog',
				elementId: 'mini-character-sheet',
        data: {
          creatureId: this.activeCreature,
        },
			});
    },
    clickProperty({_id}){
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${_id}`,
        data: {_id},
      });
    },
    transformScroll(event) {
      if (!event.deltaY) {
        return;
      }
      event.currentTarget.scrollLeft += event.deltaY + event.deltaX;
      event.preventDefault();
    },
    untarget(id){
      const index = this.targets.indexOf(id);
      if (index > -1) {
        this.targets.splice(index, 1);
      }
    }
  }
}
</script>

<style lang="css" scoped>
.initiative-row > .v-card {
  flex-grow: 0;
  flex-shrink: 0;
  height: 162px;
  width: 100px;
  margin: 4px;
}
.action-row > .v-card {
  flex-grow: 0;
  flex-shrink: 0;
  max-height: 320px;
  width: 200px;
  margin: 4px;
  overflow-y: hidden;
}
</style>
