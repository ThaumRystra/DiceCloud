<template lang="html">
  <div
    class="tabletop layout column"
    style="height: 100%;"
  >
    <v-container
      fluid
    >
      <v-row
        density="compact"
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
          class="d-flex flex-column ma-1 flex-grow-0 flex-shrink-0"
        >
          <v-btn
            data-id="select-creatures"
            class="mb-2"
            @click="addCreature"
            prepend-icon="mdi-plus"
          >
            Add Character
          </v-btn>
          <v-btn
            data-id="creatures-from-library"
            @click="addCreatureFromLibrary"
            prepend-icon="mdi-plus"
          >
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
      @wheel="transformScroll($event)"
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

<script setup lang="ts">
import { ref, reactive, provide, watch } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import addCreaturesToTabletop from '/imports/api/tabletop/methods/addCreaturesToTabletop';
import { eventBus } from '/imports/client/ui/eventBus';
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
import doAction from '/imports/client/ui/creature/actions/doAction';

function getProperties(creatureId: string, selector: any = {}) {
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
  }, { sort: { left: 1 } });
}

const props = defineProps<{ model: any; }>();

const store = useStore();
const selectedCreatureBarRef = ref<InstanceType<typeof SelectedCreatureBar>>();

const activeCreatureId = ref<string | undefined>(undefined);
const activeActionId = ref<string | undefined>(undefined);
const targets = ref<string[]>([]);

const { result: editPermission } = autorun(() => {
  if (!activeCreatureId.value) return false;
  try {
    assertEditPermission(activeCreatureId.value, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

provide('context', reactive({ editPermission }));

watch(activeCreatureId, (id) => {
  eventBus.emit('active-tabletop-character-change', id);
});

watch(activeActionId, () => {
  targets.value = [];
});

watch(targets, async (val) => {
  if (val.length === 1 && activeAction.value?.target === 'singleTarget') {
    try {
      await doAction({
        propId: activeActionId.value,
        creatureId: activeCreatureId.value,
        targetIds: targets.value,
        $store: store,
        elementId: 'tabletop-action-card',
        callback: (action: any) => action?._id || activeActionId.value,
      });
    } catch (e: any) {
      console.error(e);
      snackbar({ text: e.message || e.reason || e.toString() });
    }
    if (selectedCreatureBarRef.value) {
      selectedCreatureBarRef.value.selectedIcon = undefined;
    }
  }
});

const { result: creatures } = autorun(() => Creatures.find({ tabletopId: props.model._id }));

const { result: actions } = autorun(() =>
  getProperties(activeCreatureId.value, { type: 'action', actionType: { $ne: 'event' } })
);

const { result: activeAction } = autorun(() => CreatureProperties.findOne(activeActionId.value));

const { result: moreTargets } = autorun(() => {
  const action = activeAction.value;
  if (!action) return;
  if (action.target === 'singleTarget') return targets.value.length === 0;
  if (action.target === 'multipleTargets') return true;
});

function toggleDrawer() { store.commit('toggleDrawer'); }

function addCreature() {
  store.commit('pushDialogStack', {
    component: 'select-creatures-dialog',
    elementId: 'select-creatures',
    data: { startingSelection: creatures.value?.map((c: any) => c._id) ?? [] },
    callback: async (charIds: string[]) => {
      if (!charIds) return;
      try {
        await addCreaturesToTabletop.callAsync({ tabletopId: props.model._id, creatureIds: charIds });
      } catch (error: any) {
        console.error(error);
        snackbar({ text: error.message || error.toString() });
      }
    },
  });
}

function addCreatureFromLibrary() {
  store.commit('pushDialogStack', {
    component: 'creature-from-library-dialog',
    elementId: 'creatures-from-library',
    data: {},
    callback: async (libraryNodeIds: string[]) => {
      if (!libraryNodeIds) return;
      try {
        await addCreaturesFromLibraryToTabletop.callAsync({ tabletopId: props.model._id, libraryNodeIds });
      } catch (error: any) {
        console.error(error);
        snackbar({ text: error.reason || error.message || error.toString() });
      }
    },
  });
}

function openCharacterSheetDialog() {
  store.commit('pushDialogStack', {
    component: 'character-sheet-dialog',
    elementId: 'mini-character-sheet',
    data: { creatureId: activeCreatureId.value },
  });
}

function clickProperty({ _id }: { _id: string }) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `${_id}`,
    data: { _id },
  });
}

function transformScroll(event: WheelEvent) {
  if (!event.deltaY) return;
  (event.currentTarget as HTMLElement).scrollLeft += event.deltaY;
  event.preventDefault();
}

function untarget(id: string) {
  const index = targets.value.indexOf(id);
  if (index > -1) targets.value.splice(index, 1);
}

async function removeCreature(creatureId: string) {
  if (activeCreatureId.value === creatureId) activeCreatureId.value = undefined;
  try {
    await removeCreatureFromTabletop.callAsync({ tabletopId: props.model._id, creatureIds: [creatureId] });
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.message || error.toString() });
  }
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
