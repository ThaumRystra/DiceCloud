<template lang="html">
  <div
    v-if="creatureId"
    class="selected-creature-bar d-flex"
  >
    <tabletop-buff-icons
      creature-id="creatureId"
      @select-icon="selectIcon"
    />
    <tabletop-portrait
      creature-id="creatureId"
      @select-icon="selectIcon"
    />
    <tabletop-actions
      creature-id="creatureId"
      @select-icon="selectIcon"
    />
    <tabletop-grouped-folders
      creature-id="creatureId"
      @select-icon="selectIcon"
    />
    <tabletop-resources
      creature-id="creatureId"
      @select-icon="selectIcon"
    />
    <tabletop-creature-sheet-tabs
      creature-id="creatureId"
      @select-icon="selectIcon"
    />
    <tabletop-detail-popover />
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';

import TabletopPortrait from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopPortrait.vue';
import TabletopBuffIcons from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopBuffIcons.vue';
import TabletopActions from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopActions.vue';
import TabletopGroupedFolders from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopGroupedFolders.vue';
import TabletopResources from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopResources.vue';
import TabletopCreatureSheetTabs from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopCreatureSheetTabs.vue';
import TabletopDetailPopover from '/imports/client/ui/tabletop/selectedCreatureBar/TabletopDetailPopover.vue';

export default {
  components: {
    TabletopPortrait,
    TabletopBuffIcons,
    TabletopActions,
    TabletopGroupedFolders,
    TabletopResources,
    TabletopCreatureSheetTabs,
  },
  props: {
    creatureId: {
      type: String,
      default: undefined,
    },
  },.
  
  meteor: {
    creature() {
      if (!this.creatureId) return;
      return Creatures.findOne(this.creatureId)
    },
    iconGroups() {
      if (!this.creature) return;
      const iconGroups = [];

      // Get the standard icons
      const standardIconsById = {
        'cast-spell': { groupName: 'standardActions' },
        'make-check': { groupName: 'standardActions' },
        'roll-dice': { groupName: 'standardActions' },
        'tab-stats': { groupName: 'tabs' },
        'tab-actions': { groupName: 'tabs' },
        'tab-spells': { groupName: 'tabs' },
        'tab-inventory': { groupName: 'tabs' },
        'tab-features': { groupName: 'tabs' },
        'tab-journal': { groupName: 'tabs' },
        'tab-build': { groupName: 'tabs' },
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
        fields: { _id: 1 },
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

        const groupName = standardIcon.groupName;
        if (!groupsByName[groupName]) {
          groupsByName[groupName] = { name: groupName, iconList: [] };
          defaultGroups.push(groupsByName[groupName]);
        }

        groupsByName[groupName].iconList.push({ standardId: key });
      }
      return iconGroups;
    }
  },
  methods: {
    selectIcon(e) {
      this.$emit('select-icon', e);
    },
  }
}
</script>

<style lang="css" scoped>
  .selected-creature-bar {
    height: 140px;
    max-height: 30%;
    width: 100%;
    overflow-x: auto;
    overflow-y: visible;
  }
</style>