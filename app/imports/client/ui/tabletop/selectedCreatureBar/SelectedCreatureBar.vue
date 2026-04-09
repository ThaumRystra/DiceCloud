<template lang="html">
  <div
    v-if="creatureId"
    class="selected-creature-bar d-flex pa-3  align-end"
    style="gap: 8px;"
  >
    <v-menu
      v-model="menuOpen"
      v-click-outside="{
        handler: clickOutsideMenu,
        include: menuClickOutsideInclude,
      }"
      location="top"
      origin="center bottom"
      :close-on-click="false"
      :content-class="`tabletop-prop-menu rows-${rows}`"
      :close-on-content-click="false"
      style="z-index: 2"
    >
      <template #activator>
        <div
          ref="menuActivator"
          style="position: fixed; width: 1px; height: 1px; pointer-events: none;"
          :style="{ left: menuX + 'px', top: menuY + 'px' }"
        />
      </template>
      <tabletop-action-card
        v-if="selectedProp && selectedProp.type === 'action'"
        style="width: 300px;"
        :style="{
          width: '300px',
          opacity: selectedIcon ? 1 : 0.7,
          transition: 'opacity 0.2s ease',
        }"
        :model="selectedProp"
        :targets="targets"
        data-id="tabletop-action-card"
        @close-menu="menuOpen = false"
        @dialog-opened="menuOpen = false"
        @open-details="openPropertyDetails('tabletop-action-card')"
      />
      <tabletop-buff-card
        v-if="selectedProp && selectedProp.type === 'buff'"
        style="width: 300px;"
        :style="{
          width: '300px',
          opacity: selectedIcon ? 1 : 0.7,
          transition: 'opacity 0.2s ease',
        }"
        :model="selectedProp"
        data-id="tabletop-buff-card"
        @close-menu="menuOpen = false"
        @dialog-opened="menuOpen = false"
        @open-details="openPropertyDetails('tabletop-buff-card')"
      />
      <v-card
        v-else-if="activeIcon && activeIcon.tab"
        style="width: 300px"
        data-id="tabletop-standard-card"
      >
        <v-card-title>
          <v-icon class="mr-1">
            {{ activeIcon.icon }}
          </v-icon>
          {{ activeIcon.tabName }}
        </v-card-title>
      </v-card>
      <v-card
        v-else-if="activeIcon && activeIcon.actionName"
        style="width: 300px"
      >
        <v-card-title>
          <v-icon class="mr-1">
            {{ activeIcon.icon }}
          </v-icon>
          {{ activeIcon.actionName }}
        </v-card-title>
      </v-card>
    </v-menu>
    <v-card
      class="delete-card"
    >
      <div
        class="d-flex"
      >
        <creature-bar-icon
          icon="mdi-delete"
          data-id="trashIcon"
          @click="$emit('remove')"
        />
      </div>
    </v-card>
    <v-card
      v-if="iconGroups.buffs"
      class="buffs-card"
    >
      <div
        v-for="(row, rowIndex) in iconGroups.buffs.rows"
        :key="rowIndex"
        class="d-flex"
      >
        <template
          v-for="(icon, iconIndex) in row"
          :key="icon.propId || iconIndex"
        >
          <creature-bar-icon
            :prop-id="icon.propId"
            :icon="icon.icon"
            :selected="selectedIcon === icon"
            :data-id="icon.propId || icon.standardId"
            @click="e => selectIcon(e, icon)"
            @mouseenter="e => hoverIcon(e, icon)"
            @mouseleave="unHoverIcon(icon)"
          />
        </template>
      </div>
    </v-card>
    <v-card
      class="creature-portrait"
      :width="90"
      :height="120"
    >
      <v-img
        v-if="creature.picture"
        :height="120"
        :src="creature.picture"
        position="top center"
      />
      <div
        v-else
        class="fill-height d-flex align-center justify-center"
        style="opacity: 0.2;"
      >
        <v-icon
          size="90"
        >
          mdi-account
        </v-icon>
      </div>
    </v-card>
    <v-card
      v-for="group in iconGroups"
      :key="group.name"
    >
      <div
        v-for="(row, rowIndex) in group.rows"
        :key="rowIndex"
        class="d-flex"
      >
        <template
          v-for="(icon, iconIndex) in row"
          :key="icon.propId || iconIndex"
        >
          <creature-bar-icon
            :prop-id="icon.propId"
            :icon="icon.icon"
            :selected="selectedIcon === icon"
            :data-id="icon.propId || icon.standardId"
            @click="e => selectIcon(e, icon)"
            @mouseenter="e => hoverIcon(e, icon)"
            @mouseleave="unHoverIcon(icon)"
          />
        </template>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import TabletopActionCard from '/imports/client/ui/tabletop/TabletopActionCard.vue';
import TabletopBuffCard from '/imports/client/ui/tabletop/TabletopBuffCard.vue';
import CreatureBarIcon from '/imports/client/ui/tabletop/selectedCreatureBar/CreatureBarIcon.vue';
import { compact, chunk } from 'lodash';

function splitToNChunks(inputArray: any[], n: number) {
  return chunk(inputArray, Math.ceil(inputArray.length / n));
}

const props = defineProps<{
  creatureId?: string;
  targets: any[];
}>();

const emit = defineEmits(['active-action-change']);

const store = useStore();

const rows = ref(2);
const hoveredIcon = ref<any>(undefined);
const selectedIcon = ref<any>(undefined);
const lastIcon = ref<any>(undefined);
const menuOpen = ref(false);
const menuX = ref(200);
const menuY = ref(window.innerHeight - 216);

const activeIcon = computed(() => selectedIcon.value || hoveredIcon.value);

watch(menuOpen, (val) => {
  if (!val && selectIcon) {
    selectedIcon.value = undefined;
  }
});

watch(selectedIcon, ({ propId } = {} as any) => {
  emit('active-action-change', propId);
}, { immediate: true });

defineExpose({ selectedIcon });

function hoverIcon(e: MouseEvent, icon: any) {
  if (selectedIcon.value) return;
  const { left, right } = (e.target as HTMLElement).getBoundingClientRect();
  menuX.value = (left + right) / 2;
  hoveredIcon.value = icon;
  menuOpen.value = true;
}

function unHoverIcon(icon: any) {
  if (hoveredIcon.value === icon) {
    hoveredIcon.value = undefined;
    if (!selectedIcon.value) {
      menuOpen.value = false;
    }
  }
}

function selectIcon(e: MouseEvent, icon: any) {
  if (icon.tab) {
    openCharacterSheet(icon.tab, icon.standardId);
    return;
  }
  if (icon.actionName) {
    openStandardAction(icon.standardId);
    return;
  }
  if (selectedIcon.value === icon) {
    selectedIcon.value = undefined;
    menuOpen.value = false;
    return;
  }
  const { left, right } = (e.target as HTMLElement).getBoundingClientRect();
  menuX.value = (left + right) / 2;
  selectedIcon.value = icon;
  menuOpen.value = true;
}

function clickOutsideMenu() {
  menuOpen.value = false;
}

function menuClickOutsideInclude() {
  const outside = compact([
    document.querySelector('.selected-creature-bar'),
    ...document.querySelectorAll('.tabletop-creature-card'),
    document.querySelector('.tabletop-prop-menu'),
  ]);
  return outside;
}

function openCharacterSheet(tab: string, elementId: string) {
  menuOpen.value = false;
  store.commit('setTabForCharacterSheet', { id: props.creatureId, tab });
  store.commit('pushDialogStack', {
    component: 'character-sheet-dialog',
    elementId,
    data: { creatureId: props.creatureId },
  });
}

function openStandardAction(standardId: string) {
  menuOpen.value = false;
  if (standardId === 'cast-spell') {
    store.commit('pushDialogStack', {
      component: 'cast-spell-with-slot-dialog',
      elementId: 'cast-spell',
      data: { creatureId: props.creatureId },
    });
  }
}

function openPropertyDetails(elementId: string) {
  menuOpen.value = false;
  const propId = selectedProp.value._id;
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId,
    data: { _id: propId },
    callback: () => propId,
  });
}

const { result: creature } = autorun(() => {
  if (!props.creatureId) return;
  return Creatures.findOne(props.creatureId);
});

const { result: selectedProp } = autorun(() => {
  const propId = activeIcon.value?.propId;
  if (!propId) return;
  return CreatureProperties.findOne(propId);
});

const { result: iconGroups } = autorun(() => {
  if (!creature.value) return;
  const iconGroupsArr: any[] = [];

  const standardIconsById: Record<string, any> = {
    'cast-spell': { standardId: 'cast-spell', groupName: 'Standard Actions', icon: 'mdi-fire', actionName: 'Cast Spell' },
    'tab-stats': { standardId: 'tab-stats', groupName: 'Tabs', icon: 'mdi-chart-box', tab: 'stats', tabName: 'Stats' },
    'tab-actions': { standardId: 'tab-actions', groupName: 'Tabs', icon: 'mdi-lightning-bolt', tab: 'actions', tabName: 'Actions' },
    'tab-spells': (creature.value as any)?.settings?.hideSpellsTab ? undefined : { standardId: 'tab-spells', groupName: 'Tabs', icon: 'mdi-fire', tab: 'spells', tabName: 'Spells' },
    'tab-inventory': { standardId: 'tab-inventory', groupName: 'Tabs', icon: 'mdi-cube', tab: 'inventory', tabName: 'Inventory' },
    'tab-features': { standardId: 'tab-features', groupName: 'Tabs', icon: 'mdi-text', tab: 'features', tabName: 'Features' },
    'tab-journal': { standardId: 'tab-journal', groupName: 'Tabs', icon: 'mdi-book-open-variant', tab: 'journal', tabName: 'Journal' },
    'tab-build': { standardId: 'tab-build', groupName: 'Tabs', icon: 'mdi-wrench', tab: 'build', tabName: 'Build' },
  };

  const folderGroupsById: Record<string, any> = {};
  CreatureProperties.find({
    'root.id': props.creatureId,
    type: 'folder',
    groupStats: true,
    hideStatsGroup: true,
    removed: { $ne: true },
    inactive: { $ne: true },
  }, { fields: { _id: 1 } }).forEach((folder: any) => {
    const folderGroup = { name: folder._id, iconList: [] };
    iconGroupsArr.push(folderGroup);
    folderGroupsById[folder._id] = folderGroup;
  });

  const filter: any = {
    'root.id': props.creatureId,
    $and: [
      { $or: [{ type: 'action' }, { type: 'buff' }] },
      { $or: [{ inactive: { $ne: true } }, { type: 'toggle' }] },
    ],
    removed: { $ne: true },
  };
  if ((creature.value as any).settings?.hideUnusedStats) {
    filter.hide = { $ne: true };
  }

  const propsById: Record<string, any> = {};
  const props_: any[] = [];
  CreatureProperties.find(filter, {
    sort: { left: -1 },
    fields: { _id: 1, type: 1, parentId: 1 },
  }).forEach((prop: any) => {
    props_.push(prop);
    propsById[prop._id] = prop;
    if (folderGroupsById[prop.parentId]) {
      prop._placedInGroup = true;
      folderGroupsById[prop.parentId].iconList.push({ propId: prop._id });
    }
  });

  const groupsByName: Record<string, any> = {};
  const defaultGroups: any[] = [];

  props_.forEach((prop: any) => {
    if (prop._placedInGroup) return;
    let groupName: string | undefined;
    switch (prop.type) {
      case 'buff': groupName = 'Buffs'; break;
      case 'action': groupName = 'Actions'; break;
      case 'resource': groupName = 'Resources'; break;
      case 'folder': groupName = 'Folders'; break;
    }
    if (!groupName) return;
    if (!groupsByName[groupName]) {
      groupsByName[groupName] = { name: groupName, iconList: [] };
      if (groupName !== 'Buffs') {
        defaultGroups.push(groupsByName[groupName]);
      }
    }
    groupsByName[groupName].iconList.push({ propId: prop._id });
  });

  for (const key in standardIconsById) {
    const standardIcon = standardIconsById[key];
    if (!standardIcon) continue;
    if (standardIcon._placedInGroup) continue;
    const groupName = standardIcon.groupName || 'no';
    if (!groupsByName[groupName]) {
      groupsByName[groupName] = { name: groupName, iconList: [] };
      defaultGroups.push(groupsByName[groupName]);
    }
    groupsByName[groupName].iconList.push(standardIcon);
  }

  iconGroupsArr.push(...defaultGroups);
  (iconGroupsArr as any).buffs = groupsByName['Buffs'];

  iconGroupsArr.forEach((group: any) => {
    group.rows = splitToNChunks(group.iconList, rows.value);
  });
  if ((iconGroupsArr as any).buffs) {
    (iconGroupsArr as any).buffs.rows = splitToNChunks((iconGroupsArr as any).buffs.iconList, rows.value);
  }

  const filteredIconGroups = iconGroupsArr.filter((group: any) => group.iconList.length);
  (filteredIconGroups as any).buffs = (iconGroupsArr as any).buffs;
  return filteredIconGroups;
});
</script>

<style lang="css">
  .tabletop-prop-menu {
    top: unset !important;
    transition: all 0.2s ease;
  }
  .tabletop-prop-menu.rows-1 {
    bottom: 80px;
  }
  .tabletop-prop-menu.rows-2 {
    bottom: 124px;
  }
  .tabletop-prop-menu.rows-3 {
    bottom: 168px;
  }
  .tabletop-prop-menu.rows-4 {
    bottom: 212px;
  }
</style>
