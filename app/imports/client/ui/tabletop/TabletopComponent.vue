<template lang="html">
  <div
    class="tabletop layout column"
    style="height: 100%;"
  >
    <v-container
      fluid
    >
      <v-row
        dense
        class="initiative-row flex-grow-0 overflow-x-auto"
        style="flex-wrap: nowrap; padding-bottom: 64px; min-width: 200px;"
        @wheel="transformScroll($event)"
      >
        <v-btn
          icon
          @click="toggleDrawer"
        >
          <v-icon> mdi-menu </v-icon>
        </v-btn>
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
          class="layout column ma-1 flex-grow-0 flex-shrink-0"
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
          <v-btn
            data-id="creatures-from-library"
            @click="addCreatureFromLibrary"
          >
            <v-icon left>
              mdi-plus
            </v-icon>
            Add Creature
          </v-btn>
        </div>
      </v-row>
      <div
        class="d-flex align-stretch"
        style="max-height: calc(100vh - 364px); margin-top: -24px;"
      >
        <v-spacer />
        <tabletop-log-stream
          :tabletop-id="$route.params.id"
          class="pl-4"
          style="overflow: auto; max-width: 500px;"
        />
      </div>
    </v-container>
    <v-footer
      class="pa-0"
      style="
        background: none; 
        box-shadow: none;
        position: absolute;
        left: 0; 
        bottom:0;
        right: 0;
        overflow-x: auto;
      "
      @wheel.native="transformScroll($event)"
    >
      <v-slide-y-reverse-transition mode="out-in">
        <selected-creature-bar
          :key="activeCreatureId"
          ref="selectedCreatureBar"
          :creature-id="activeCreatureId"
          :targets="targets"
          @active-action-change="activeActionId = $event"
          @remove="removeCreature(activeCreatureId)"
        />
      </v-slide-y-reverse-transition>
    </v-footer>
    <tabletop-map
      class="play-area"
      style="
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: -50;
      "
    />
  </div>
</template>

<script lang="js">
import addCreaturesToTabletop from '/imports/api/tabletop/methods/addCreaturesToTabletop';
import TabletopCreatureCard from '/imports/client/ui/tabletop/TabletopCreatureCard.vue';
import TabletopMap from '/imports/client/ui/tabletop/TabletopMap.vue';
import TabletopLogStream from '/imports/client/ui/tabletop/TabletopLogStream.vue';
import Creatures from '/imports/api/creature/creatures/Creatures';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import SelectedCreatureBar from '/imports/client/ui/tabletop/selectedCreatureBar/SelectedCreatureBar.vue';
import addCreaturesFromLibraryToTabletop from '/imports/api/tabletop/methods/addCreaturesFromLibraryToTabletop';
import removeCreatureFromTabletop from '/imports/api/tabletop/methods/removeCreatureFromTabletop';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { mapMutations } from 'vuex';
import doAction from '/imports/client/ui/creature/actions/doAction';

const getProperties = function (creatureId, selector = {}) {
  return CreatureProperties.find({
    ...getFilter.descendantsOfRoot(creatureId),
    inactive: { $ne: true },
    removed: { $ne: true },
    overridden: { $ne: true },
    $nor: [
      { hideWhenTotalZero: true, total: 0 },
      { hideWhenValueZero: true, value: 0 },
    ],
    ...selector,
  }, {
    sort: { left: 1 }
  });
}

export default {
  components: {
    TabletopCreatureCard,
    TabletopMap,
    SelectedCreatureBar,
    TabletopLogStream,
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
    },
    activeActionId() {
      this.targets = [];
    },
    targets(val) {
      if (val.length === 1 && this.activeAction?.target === 'singleTarget') {
        doAction({
          propId: this.activeActionId,
          creatureId: this.activeCreatureId,
          targetIds: this.targets,
          $store: this.$store,
          elementId: 'tabletop-action-card',
          callback: action => action?._id || this.activeActionId,
        }).catch((e) => {
          console.error(e);
          snackbar({ text: e.message || e.reason || e.toString() });
        }).finally(() => {
          this.doActionLoading = false;
        });
        this.$refs.selectedCreatureBar.selectedIcon = undefined;
      }
    },
  },
  meteor: {
    creatures(){
      return Creatures.find({ tabletopId: this.model._id });
    },
    actions(){
      return getProperties(this.activeCreatureId, { type: 'action', actionType: { $ne: 'event'} });
    },
    activeAction() {
      return CreatureProperties.findOne(this.activeActionId);
    },
    moreTargets() {
      const activeAction = this.activeAction;
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
    ...mapMutations([
      'toggleDrawer',
    ]),
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
            if (error) {
              console.error(error)
              snackbar({ text: error.message || error.toString() });
            }
          });
        },
      });
    },
    addCreatureFromLibrary(){
      this.$store.commit('pushDialogStack', {
        component: 'creature-from-library-dialog',
        elementId: 'creatures-from-library',
        data: {},
        callback: (libraryNodeIds) => {
          if (!libraryNodeIds) return;
          addCreaturesFromLibraryToTabletop.call({
            tabletopId: this.model._id,
            libraryNodeIds,
          }, error => {
            if (error) {
              console.error(error)
              snackbar({ text: error.reason || error.message || error.toString() });
            }
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
    },
    removeCreature(creatureId) {
      if (this.activeCreatureId === creatureId) this.activeCreatureId = undefined;
      removeCreatureFromTabletop.call({
        tabletopId: this.model._id,
        creatureIds: [creatureId]
      }, error => {
        if (!error) return;
        console.error(error);
        snackbar({ text: error.message || error.toString() });
      });
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
