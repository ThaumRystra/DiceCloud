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
      :position-x="menuX"
      :position-y="menuY"
      absolute
      top
      :nudge-left="150"
      origin="center bottom"
      :close-on-click="false"
      :content-class="`tabletop-prop-menu rows-${rows}`"
      :close-on-content-click="false"
    >
      <tabletop-action-card
        v-if="selectedProp && selectedProp.type === 'action'"
        style="width: 300px;"
        :style="{
          width: '300px',
          opacity: selectedIcon ? 1 : 0.7,
          transition: 'opacity 0.2s ease',
        }"
        :model="selectedProp"
        @close-menu="menuOpen = false"
      />
      <v-card
        v-else-if="activeIcon && activeIcon.tab"
        style="width: 300px"
      >
        <v-card-title>
          <v-icon left>
            {{ activeIcon.icon }}
          </v-icon>
          {{ activeIcon.tabName }}
        </v-card-title>
      </v-card>
    </v-menu>
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
        >
          <creature-bar-icon
            :key="icon.propId || iconIndex"
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
        >
          <creature-bar-icon
            :key="icon.propId || iconIndex"
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

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import TabletopActionCard from '/imports/client/ui/tabletop/TabletopActionCard.vue';
import CreatureBarIcon from '/imports/client/ui/tabletop/selectedCreatureBar/CreatureBarIcon.vue';
import { compact } from 'lodash';

//import TabletopPortrait from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopPortrait.vue';
//import TabletopBuffIcons from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopBuffIcons.vue';
//import TabletopActions from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopActions.vue';
//import TabletopGroupedFolders from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopGroupedFolders.vue';
//import TabletopResources from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopResources.vue';
//import TabletopCreatureSheetTabs from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopCreatureSheetTabs.vue';
//import TabletopDetailPopover from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopDetailPopover.vue';

function splitToNChunks(inputArray, n) {
  let result = [];
  const array = [...inputArray] // Create shallow copy, because splice mutates array
  for (let i = n; i > 0; i--) {
      result.push(array.splice(0, Math.ceil(array.length / i)));
  }
  return result;
}

export default {
  components: {
    //TabletopPortrait,
    //TabletopBuffIcons,
    //TabletopActions,
    //TabletopGroupedFolders,
    //TabletopResources,
    //TabletopCreatureSheetTabs,
    CreatureBarIcon,
    TabletopActionCard,
},
  props: {
    creatureId: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      rows: 2,
      hoveredIcon: undefined,
      selectedIcon: undefined,
      menuOpen: false,
      menuX: 200,
      menuY: window.innerHeight - 216,
    };
  },
  computed: {
    activeIcon() {
      return this.selectedIcon || this.hoveredIcon;
    }
  },
  watch: {
    menuOpen(val) {
      if (!val && this.selectIcon) {
        this.selectedIcon = undefined;
      }
    },
    selectedIcon: {
      immediate: true,
      handler: function ({ propId } = {}) {
        this.$emit('active-action-change', propId)
      }
    }
  },
  methods: {
    log(e) {
      console.log(e);
    },
    hoverIcon(e, icon) {
      if (this.selectedIcon) return;
      // this.menuX = e.clientX - (e.clientX % 44);
      const { left, right } = e.target.getBoundingClientRect();
      const x = ( left + right ) / 2
      this.menuX = x;
      this.hoveredIcon = icon;
      this.menuOpen = true;
    },
    unHoverIcon(icon) {
      if (this.hoveredIcon === icon) {
        this.hoveredIcon = undefined;
        if (!this.selectedIcon) {
          this.menuOpen = false;
        }
      }
    },
    selectIcon(e, icon) {
      if (icon.tab) {
        this.openCharacterSheet(icon.tab, icon.standardId);
        return;
      }
      if (this.selectedIcon === icon) {
        this.selectedIcon = undefined;
        this.menuOpen = false;
        return;
      }
      const { left, right } = e.target.getBoundingClientRect();
      const x = ( left + right ) / 2
      this.menuX = x;
      this.selectedIcon = icon;
      this.menuOpen = true;
    }, 
    clickOutsideMenu () {
      this.menuOpen = false;
    },
    menuClickOutsideInclude() {
      const outside = compact([
        document.querySelector('.selected-creature-bar'),
        ...document.querySelectorAll('.tabletop-creature-card'),
        document.querySelector('.tabletop-prop-menu'),
      ]);
      return outside;
    },
    openCharacterSheet(tab, elementId) {
      this.$store.commit(
        'setTabForCharacterSheet',
        { id: this.creatureId, tab }
      );
      this.$store.commit('pushDialogStack', {
				component: 'character-sheet-dialog',
				elementId,
        data: {
          creatureId: this.creatureId,
        },
			});
    },
  },
  meteor: {
    creature() {
      if (!this.creatureId) return;
      return Creatures.findOne(this.creatureId)
    },
    selectedProp() {
      const propId = this.activeIcon?.propId;
      if (!propId) return;
      return CreatureProperties.findOne(propId);
    },
    iconGroups() {
      if (!this.creature) return;
      const iconGroups = [];

      // Get the standard icons
      const standardIconsById = {
        'cast-spell': {standardId: 'cast-spell', groupName: 'Standard Actions', icon: 'mdi-fire' },
        'make-check': {standardId: 'make-check', groupName: 'Standard Actions', icon: 'mdi-radiobox-marked' },
        'roll-dice': {standardId: 'roll-dice', groupName: 'Standard Actions', icon: 'mdi-dice-d20' },
        'tab-stats': {standardId: 'tab-stats', groupName: 'Tabs', icon: 'mdi-chart-box', tab: 'stats', tabName: 'Stats' },
        'tab-actions': {standardId: 'tab-actions', groupName: 'Tabs', icon: 'mdi-lightning-bolt', tab: 'actions', tabName: 'Actions' },
        'tab-spells': this.creature?.settings?.hideSpellsTab ? undefined : {standardId: 'tab-spells', groupName: 'Tabs', icon: 'mdi-fire', tab: 'spells', tabName: 'Spells' },
        'tab-inventory': {standardId: 'tab-inventory', groupName: 'Tabs', icon: 'mdi-cube', tab: 'inventory', tabName: 'Inventory' },
        'tab-features': {standardId: 'tab-features', groupName: 'Tabs', icon: 'mdi-text', tab: 'features', tabName: 'Features' },
        'tab-journal': {standardId: 'tab-journal', groupName: 'Tabs', icon: 'mdi-book-open-variant', tab: 'journal', tabName: 'Journal' },
        'tab-build': {standardId: 'tab-build', groupName: 'Tabs', icon: 'mdi-wrench', tab: 'build', tabName: 'Build' },
      };

      // Get the folders that could hide a property
      const folderIds = CreatureProperties.find({
        'root.id': this.creatureId,
        type: 'folder',
        groupStats: true,
        hideStatsGroup: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, { fields: { _id: 1 } }).map(folder => folder._id);

      // Get the properties that need to be shown as an icon
      const filter = {
        'root.id': this.creatureId,
        'parentId': {
          $nin: folderIds,
        },
        $and: [
          {
            $or: [
              { type: 'action' },
              { type: 'folder', groupStats: true },
              { type: 'attribute' },
              { type: 'toggle' },
              { type: 'buff' }
            ],
          },
          {
            $or: [
              { inactive: { $ne: true } },
              { type: 'toggle' },
            ]
          }
        ],
        removed: { $ne: true },
      };
      if (this.creature.settings?.hideUnusedStats) {
        filter.hide = { $ne: true };
      }

      // Get all the properties we wish to display, with just their IDs, and store them
      const propsById = {};
      const props = [];
      CreatureProperties.find(filter, {
        sort: { left: -1 },
        fields: { _id: 1, type: 1 },
      }).forEach(prop => {
        props.push(prop);
        propsById[prop._id] = prop;
      });

      // Using the creature's custom icon groups, collect the props into groups
      this.creature.tabletopSettings?.iconGroups.forEach(group => {
        const iconList = [];
        group.iconIds?.forEach(id => {
          if (propsById[id]) {
            const prop = propsById[id];
            prop._placedInGroup = true;
            iconList.push({ propId: prop._id });
          } else if (standardIconsById[id]) {
            const standardIcon = standardIconsById[id];
            standardIcon._placedInGroup = true;
            iconList.push(standardIcon);
          }
        });
        iconGroups.push({
          name: group.name,
          iconList,
        });
      });

      // Default groups
      let groupsByName = {};
      let defaultGroups = [];

      // Add default groups for props that have not yet been collected into custom groups
      props.forEach(prop => {
        if (prop._placedInGroup) return;
        let groupName;
        switch (prop.type) {
          case 'buff': groupName = 'Buffs'; break;
          case 'action': groupName = 'Actions'; break;
          case 'resource': groupName = 'Resources'; break;
          case 'folder': groupName = 'Folders'; break;
        }
        if (!groupName) return;
        if (!groupsByName[groupName]) {
          groupsByName[groupName] = { name: groupName, iconList: [] };
          if (groupName !== 'Buffs') { // don't add buffs to the default groups, it is handled differently
            defaultGroups.push(groupsByName[groupName]);
          }
        }
        groupsByName[groupName].iconList.push({ propId: prop._id });
      });

      // Add default groups for standard icons
      for (let key in standardIconsById) {
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

      iconGroups.push(...defaultGroups);

      // Store a specific reference to buffs outside of the list order
      iconGroups.buffs = groupsByName['Buffs'];

      // Divide the icons into rows
      iconGroups.forEach(group => {
        group.rows = splitToNChunks(group.iconList, this.rows);
      });
      if (iconGroups.buffs) {
        iconGroups.buffs.rows = splitToNChunks(iconGroups.buffs.iconList, this.rows);
      }

      return iconGroups;
    }
  },
}
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