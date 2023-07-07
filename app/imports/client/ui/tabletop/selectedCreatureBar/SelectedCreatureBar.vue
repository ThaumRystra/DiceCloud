<template lang="html">
  <div
    v-if="creatureId"
    class="selected-creature-bar d-flex pa-4"
    style="gap: 8px;"
  >
    <!--
    <tabletop-buff-icons
      creature-id="creatureId"
      @select-icon="selectIcon"
    />
    <tabletop-portrait
      creature-id="creatureId"
      @select-icon="selectIcon"
    />
    -->
    <v-menu
      v-model="selectedProp"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      offset-y
      :close-on-content-click="false"
    >
      <tabletop-action-card
        v-if="selectedProp && selectedProp.type === 'action'"
        :model="selectedProp"
      />
    </v-menu>
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
            @click="selectedIcon = icon"
            @hover="e => {selectedIcon = icon; menuX = e.clientX; menuY = e.clientY; log(e)}"
          />
        </template>
      </div>
    </v-card>
    <!--<tabletop-actions
      creature-id="creatureId"
      @select-icon="selectIcon"
    />
    <tabletop-detail-popover />
    -->
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import TabletopActionCard from '/imports/client/ui/tabletop/TabletopActionCard.vue';
import CreatureBarIcon from '/imports/client/ui/tabletop/selectedCreatureBar/CreatureBarIcon.vue';

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
      selectedIcon: undefined,
      menuX: 200,
      menuY: 200,
    };
  },
  meteor: {
    creature() {
      if (!this.creatureId) return;
      return Creatures.findOne(this.creatureId)
    },
    selectedProp() {
      if (!this.selectedIcon?.propId) return;
      return CreatureProperties.findOne(this.selectedIcon.propId);
    },
    iconGroups() {
      if (!this.creature) return;
      const iconGroups = [];

      // Get the standard icons
      const standardIconsById = {
        'cast-spell': { groupName: 'Standard Actions', icon: 'mdi-fire' },
        'make-check': { groupName: 'Standard Actions', icon: 'mdi-radiobox-marked' },
        'roll-dice': { groupName: 'Standard Actions', icon: 'mdi-dice-d20' },
        'tab-stats': { groupName: 'Tabs', icon: 'mdi-chart-box' },
        'tab-actions': { groupName: 'Tabs', icon: 'mdi-lightning-bolt' },
        'tab-spells': { groupName: 'Tabs', icon: 'mdi-fire' },
        'tab-inventory': { groupName: 'Tabs', icon: 'mdi-cube' },
        'tab-features': { groupName: 'Tabs', icon: 'mdi-text' },
        'tab-journal': { groupName: 'Tabs', icon: 'mdi-book-open-variant' },
        'tab-build': { groupName: 'Tabs', icon: 'mdi-wrench' },
      };

      // Get the folders that could hide a property
      const folderIds = CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'folder',
        groupStats: true,
        hideStatsGroup: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, { fields: { _id: 1 } }).map(folder => folder._id);

      // Get the properties that need to be shown as an icon
      const filter = {
        'ancestors.id': this.creatureId,
        'parent.id': {
          $nin: folderIds,
        },
        $and: [
          {
            $or: [
              { type: 'action' },
              { type: 'folder', groupStats: true },
              { type: 'attribute' },
              { type: 'toggle' },
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
        sort: { order: -1 },
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
          case 'action': groupName = 'Actions'; break;
          case 'resource': groupName = 'Resources'; break;
          case 'folder': groupName = 'Folders'; break;
        }
        if (!groupName) return;
        if (!groupsByName[groupName]) {
          groupsByName[groupName] = { name: groupName, iconList: [] };
          defaultGroups.push(groupsByName[groupName]);
        }
        groupsByName[groupName].iconList.push({ propId: prop._id });
      });

      // Add default groups for standard icons
      for (let key in standardIconsById) {
        const standardIcon = standardIconsById[key];
        if (standardIcon._placedInGroup) return;

        const groupName = standardIcon.groupName || 'no';
        if (!groupsByName[groupName]) {
          groupsByName[groupName] = { name: groupName, iconList: [] };
          defaultGroups.push(groupsByName[groupName]);
        }

        groupsByName[groupName].iconList.push({ standardId: key, icon: standardIcon.icon });
      }

      iconGroups.push(...defaultGroups);

      // Divide the icons into rows
      iconGroups.forEach(group => {
        group.rows = splitToNChunks(group.iconList, this.rows);
      });

      return iconGroups;
    }
  },
  methods: {
    selectIcon(e) {
      this.$emit('select-icon', e);
    },
    log(e) {
      console.log(e);
    },
  }
}
</script>

<style lang="css" scoped>
</style>