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
      style="z-index: 2"
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
          <v-icon left>
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
          <v-icon left>
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
import TabletopBuffCard from '/imports/client/ui/tabletop/TabletopBuffCard.vue';
import CreatureBarIcon from '/imports/client/ui/tabletop/selectedCreatureBar/CreatureBarIcon.vue';
import { compact, chunk } from 'lodash';
import doAction from '../../creature/actions/doAction';

function splitToNChunks(inputArray, n) {
  return chunk(inputArray, Math.ceil(inputArray.length / n));
}

export default {
  components: {
    CreatureBarIcon,
    TabletopActionCard,
    TabletopBuffCard,
  },
  props: {
    creatureId: {
      type: String,
      default: undefined,
    },
    targets: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      rows: 2,
      hoveredIcon: undefined,
      selectedIcon: undefined,
      lastIcon: undefined,
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
      if (icon.actionName) {
        this.openStandardAction(icon.standardId)
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
      this.menuOpen = false;
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
    openStandardAction(standardId) {
      this.menuOpen = false;
      if (standardId === 'cast-spell') {
        this.$store.commit('pushDialogStack', {
          component: 'cast-spell-with-slot-dialog',
          elementId: 'cast-spell',
          data: {
            creatureId: this.creatureId,
          },
        });
      }
    },
    openPropertyDetails(elementId) {
      this.menuOpen = false;
      const propId = this.selectedProp._id;
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId,
        data: { _id: propId },
        callback: () => propId
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
        'cast-spell': {standardId: 'cast-spell', groupName: this.$t('SelectedCreatureBar.fhJpWpTQTpuCrtsOioWxJ'), icon: 'mdi-fire', actionName: this.$t('SelectedCreatureBar.Zg5aaw0sAM6W64-ocA_E4') },
        // 'make-check': {standardId: 'make-check', groupName: this.$t('SelectedCreatureBar.fhJpWpTQTpuCrtsOioWxJ'), icon: 'mdi-radiobox-marked',  actionName: this.$t('SelectedCreatureBar.UcAwEN_Jmv7Lezh-o8g6S') },
        // 'roll-dice': {standardId: 'roll-dice', groupName: this.$t('SelectedCreatureBar.fhJpWpTQTpuCrtsOioWxJ'), icon: 'mdi-dice-d20', actionName: this.$t('SelectedCreatureBar.NgRLZ1KujlD3o3EtzLY3R') },
        'tab-stats': {standardId: 'tab-stats', groupName: this.$t('SelectedCreatureBar.WTl6k0_UkGQshnCnlN3t6'), icon: 'mdi-chart-box', tab: 'stats', tabName: this.$t('CharacterSheetDialog.NnBUF4ZwE2sxY2H9laU5t') },
        'tab-actions': {standardId: 'tab-actions', groupName: this.$t('SelectedCreatureBar.rsDz2jeDde3rZixCEIxLp'), icon: 'mdi-lightning-bolt', tab: 'actions', tabName: this.$t('CharacterSheetDialog.uEahuOj2R9wGkNQ-mmdBa') },
        'tab-spells': this.creature?.settings?.hideSpellsTab ? undefined : {standardId: 'tab-spells', groupName: this.$t('SelectedCreatureBar.xvb9H6sVfBt7HYtpMicQz'), icon: 'mdi-fire', tab: 'spells', tabName: this.$t('CharacterSheetDialog.D7iHe3wbPaZ2Jhsn9CXU8') },
        'tab-inventory': {standardId: 'tab-inventory', groupName: this.$t('SelectedCreatureBar.gYC1yFaOl9zXhX_ppgoWx'), icon: 'mdi-cube', tab: 'inventory', tabName: this.$t('CharacterSheetDialog.0E9n7NRcJsKcvSOh8pJGk') },
        'tab-features': {standardId: 'tab-features', groupName: this.$t('SelectedCreatureBar.o3j9IwMnvU4lhem9IzY3y'), icon: 'mdi-text', tab: 'features', tabName: this.$t('CharacterSheetDialog.7PhUWMOg_8wLLCCY7CKDz') },
        'tab-journal': {standardId: 'tab-journal', groupName: this.$t('SelectedCreatureBar.mjZ672LJyHdhMi6YmHEJn'), icon: 'mdi-book-open-variant', tab: 'journal', tabName: this.$t('CharacterSheetDialog.KOKK1cNcrY6O64cRo8aKa') },
        'tab-build': {standardId: 'tab-build', groupName: this.$t('SelectedCreatureBar.UY94rrIn40QvhXb052leI'), icon: 'mdi-wrench', tab: 'build', tabName: this.$t('CharacterSheetDialog.biA0vlRWylo6EW8GckGOx') },
      };

      // Get the folders that could hide a property
      const folderGroupsById = {};
      CreatureProperties.find({
        'root.id': this.creatureId,
        type: 'folder',
        groupStats: true,
        hideStatsGroup: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, { fields: { _id: 1 } }).forEach(folder => {
        const folderGroup = { name: folder._id, iconList: [] };
        iconGroups.push(folderGroup);
        folderGroupsById[folder._id] = folderGroup;
      });

      // Get the properties that need to be shown as an icon
      const filter = {
        'root.id': this.creatureId,
        $and: [
          {
            $or: [
              { type: 'action' },
              // { type: 'attribute' },
              // { type: 'toggle' },
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
        fields: { _id: 1, type: 1, parentId: 1 },
      }).forEach(prop => {
        props.push(prop);
        propsById[prop._id] = prop;
        // If they are in a folder, group them by that folder first
        if (folderGroupsById[prop.parentId]) {
          prop._placedInGroup = true;
          folderGroupsById[prop.parentId].iconList.push({ propId: prop._id });
        }
      });

      // Default groups
      let groupsByName = {};
      let defaultGroups = [];

      // Add default groups for props that have not yet been collected into custom groups
      props.forEach(prop => {
        if (prop._placedInGroup) return;
        let groupName;
        switch (prop.type) {
          case 'buff': groupName = this.$t('SelectedCreatureBar.Gpk8d2M8u_GVhell7SH4w'); break;
          case 'action': groupName = this.$t('CharacterSheetDialog.uEahuOj2R9wGkNQ-mmdBa'); break;
          case 'resource': groupName = this.$t('SelectedCreatureBar.tpB9wyZt3UOVoVR9e_Tvm'); break;
          case 'folder': groupName = this.$t('SelectedCreatureBar.UCE8E-qK5tW0K20yPG11i'); break;
        }
        if (!groupName) return;
        if (!groupsByName[groupName]) {
          groupsByName[groupName] = { name: groupName, iconList: [] };
          if (groupName !== this.$t('SelectedCreatureBar.oQYJ73IjGs_u96UbCpyo-')) { // don't add buffs to the default groups, it is handled differently
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
      iconGroups.buffs = groupsByName[this.$t('SelectedCreatureBar.2Fz98cxVXGhTN-LqYLLxV')];

      // Divide the icons into rows
      iconGroups.forEach(group => {
        group.rows = splitToNChunks(group.iconList, this.rows);
      });
      if (iconGroups.buffs) {
        iconGroups.buffs.rows = splitToNChunks(iconGroups.buffs.iconList, this.rows);
      }

      const filteredIconGroups = iconGroups.filter(group => group.iconList.length);
      filteredIconGroups.buffs = iconGroups.buffs;
      return filteredIconGroups;
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
