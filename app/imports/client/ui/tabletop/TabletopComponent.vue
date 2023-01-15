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
        style="flex-wrap: nowrap; overflow-x: auto; padding-bottom: 50px;"
        @wheel="transformScroll($event)"
      >
        <tabletop-creature-card
          v-for="creature in creatures"
          :key="creature._id"
          :model="creature"
          :active="activeCreatureId === creature._id"
          :targeted="targets.includes(creature._id)"
          :show-target-btn="targets.includes(creature._id) || moreTargets"
          v-on="(!activeActionId || (targets.includes(creature._id) || moreTargets)) ? {
            click: () => {
              if (activeActionId) {
                if (targets.includes(creature._id)) {
                  untarget(creature._id)
                } else {
                  if (moreTargets) targets.push(creature._id);
                }
              } else {
                activeCreatureId = creature._id;
                targets = [];
                activeActionId = undefined;
              }
            }
          } : {}"
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
          class="action-row overflow-x-auto align-end"
          style="flex-wrap: nowrap; padding-top: 100px;"
          @wheel="transformScroll($event)"
        >
          <mini-character-sheet
            v-if="activeCreatureId"
            data-id="mini-character-sheet"
            :creature-id="activeCreatureId"
            @click="openCharacterSheetDialog"
          />
          <action-card
            v-for="action in actions"
            :key="action._id"
            :model="action"
            :active="activeActionId === action._id"
            :targets="targets"
            @activate="activeActionId = action._id"
            @deactivate="activeActionId = undefined; targets = [];"
          />
        </v-row>
      </v-container>
    </v-footer>
  </div>
</template>

<script lang="js">
import addCreaturesToTabletop from '/imports/api/tabletop/methods/addCreaturesToTabletop.js';
import TabletopCreatureCard from '/imports/client/ui/tabletop/TabletopCreatureCard.vue';
import TabletopMap from '/imports/client/ui/tabletop/TabletopMap.vue';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import MiniCharacterSheet from '/imports/client/ui/creature/character/MiniCharacterSheet.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import ActionCard from '/imports/client/ui/tabletop/TabletopActionCard.vue';

const getProperties = function (creatureId, selector = {}) {
  return CreatureProperties.find({
    'ancestors.id': {
      $eq: creatureId,
    },
    inactive: { $ne: true },
    removed: { $ne: true },
    overridden: { $ne: true },
    $nor: [
      { hideWhenTotalZero: true, total: 0 },
      { hideWhenValueZero: true, value: 0 },
    ],
    ...selector,
  }, {
    sort: { order: 1 }
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
  data() {
    return {
      activeCreatureId: undefined,
      activeActionId: undefined,
      targets: [],
    }
  },
  watch: {
    activeCreatureId(id) {
      this.$root.$emit('active-tabletop-character-change', id);
    }
  },
  meteor: {
    $subscribe: {
      'tabletop'() {
        return [this.model._id];
      },
    },
    creatures(){
      return Creatures.find({ tabletop: this.model._id });
    },
    actions(){
      return getProperties(this.activeCreatureId, { type: 'action', actionType: { $ne: 'event'} });
    },
    moreTargets(){
      const activeAction = CreatureProperties.findOne(this.activeActionId);
      if (!activeAction) return;
      if (activeAction.target === 'singleTarget') {
        return this.targets.length === 0;
      } else if (activeAction.target === 'multipleTargets') {
        return true;
      }
    },
    editPermission(){
      try {
        assertEditPermission(this.activeCreatureId, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
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
    },
    openCharacterSheetDialog(){
      this.$store.commit('pushDialogStack', {
				component: 'character-sheet-dialog',
				elementId: 'mini-character-sheet',
        data: {
          creatureId: this.activeCreatureId,
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
      event.currentTarget.scrollLeft += event.deltaY;
      event.preventDefault();
    },
    untarget(id){
      const index = this.targets.indexOf(id);
      if (index > -1) {
        this.targets.splice(index, 1);
      }
    }
  },
}
</script>

<style lang="css" scoped>
.initiative-row>.v-card {
  flex-grow: 0;
  flex-shrink: 0;
  height: 162px;
  width: 100px;
  margin: 4px;
}
.action-row > div {
  flex-grow: 0;
  flex-shrink: 0;
  height: 120px;
  width: 200px;
  margin: 4px;
}
</style>
