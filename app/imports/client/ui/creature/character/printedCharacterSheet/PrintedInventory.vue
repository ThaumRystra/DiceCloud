<template lang="html">
  <div
    class="inventory"
  >
    <div class="double-border my-2">
      <div class="label text-center">
        Inventory
      </div>
      <div class="d-flex inventory-stat">
        <v-icon>$vuetify.icons.injustice</v-icon>
        Weight Carried:
        {{ weightCarried }} lb
      </div>
      <div class="d-flex inventory-stat">
        <v-icon>$vuetify.icons.cash</v-icon>
        Net worth:
        <coin-value
          class="ml-2"
          :value="variables && variables.valueTotal && variables.valueTotal.value|| 0"
        />
      </div>
      <div
        v-if="variables.itemsAttuned && variables.itemsAttuned.value"
        class="d-flex inventory-stat"
      >
        <v-icon>$vuetify.icons.spell</v-icon>
        Items attuned:
        {{ variables.itemsAttuned && variables.itemsAttuned.value }}
      </div>
    </div>
    <div class="double-border my-2">
      <div class="label text-center">
        Equipped
      </div>
      <column-layout wide-columns>
        <printed-item
          v-for="item in equippedItems"
          :key="item._id"
          :model="item"
        />
      </column-layout>
    </div>
    <div class="double-border my-2">
      <div class="label text-center">
        Carried
      </div>
      <column-layout wide-columns>
        <printed-item
          v-for="item in carriedItems"
          :key="item._id"
          :model="item"
        />
      </column-layout>
    </div>
    <div
      v-for="container in containersWithoutAncestorContainers"
      :key="container._id"
      class="double-border my-2"
    >
      <printed-container
        :model="container"
      />
      <column-layout wide-columns>
        <printed-item
          v-for="item in container.items"
          :key="item._id"
          :model="item"
        />
      </column-layout>
    </div>
  </div>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import Creatures from '/imports/api/creature/creatures/Creatures';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import getParentRefByTag from '/imports/api/creature/creatureProperties/methods/getParentRefByTag';
import BUILT_IN_TAGS from '/imports/constants/BUILT_IN_TAGS';
import CoinValue from '/imports/client/ui/components/CoinValue.vue';
import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities';
import PrintedLineItem from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedLineItem.vue';
import PrintedContainer from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedContainer.vue';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default {
  components: {
    ColumnLayout,
    CoinValue,
    PrintedItem: PrintedLineItem,
    PrintedContainer,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      organize: false,
    }
  },
  meteor: {
    containers() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        type: 'container',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { left: 1 },
      });
    },
    creature() {
      return Creatures.findOne(this.creatureId, {
        fields: {
          color: 1,
          variables: 1,
        }
      });
    },
    variables() {
      return CreatureVariables.findOne({ _creatureId: this.creatureId }) || {};
    },
    containersWithoutAncestorContainers() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        $nor: [getFilter.descendantsOfAll(this.containers)],
        type: 'container',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { left: 1 },
      }).map(c => {
        c.items = CreatureProperties.find({
          'parentId': c._id,
          type: { $in: ['item', 'container'] },
          removed: { $ne: true },
          equipped: { $ne: true },
          deactivatedByAncestor: { $ne: true },
          deactivatedByToggle: { $ne: true },
        }, {
          sort: { left: 1 },
        }).fetch();
        return c;
      });
    },
    carriedItems() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        $nor: [getFilter.descendantsOfAll(this.containers)],
        type: 'item',
        equipped: { $ne: true },
        removed: { $ne: true },
        deactivatedByAncestor: { $ne: true },
        deactivatedByToggle: { $ne: true },
      }, {
        sort: { left: 1 },
      });
    },
    equippedItems() {
      return CreatureProperties.find({
        ...getFilter.descendantsOfRoot(this.creatureId),
        type: 'item',
        equipped: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { left: 1 },
      });
    },
    equipmentParentRef() {
      return getParentRefByTag(
        this.creatureId, BUILT_IN_TAGS.equipment
      ) || getParentRefByTag(
        this.creatureId, BUILT_IN_TAGS.inventory
      ) || {
        id: this.creatureId,
        collection: 'creatures'
      };
    },
    carriedParentRef() {
      return getParentRefByTag(
        this.creatureId, BUILT_IN_TAGS.carried
      ) || getParentRefByTag(
        this.creatureId, BUILT_IN_TAGS.inventory
      ) || {
        id: this.creatureId,
        collection: 'creatures'
      };
    },
  },
  computed: {
    weightCarried() {
      return stripFloatingPointOddities(
        this.variables &&
        this.variables.weightCarried &&
        this.variables.weightCarried.value || 0
      );
    },
  },
  methods: {
    clickProperty(_id) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `tree-node-${_id}`,
        data: { _id },
      });
    },
  },
}
</script>

<style lang="css" scoped>
.label {
  font-size: 12pt;
  font-variant: small-caps;
  flex-grow: 1;
}

.inventory .double-border {
  box-decoration-break: slice;
}
.inventory-stat {
  font-size: 11pt;
  line-height: 32px;
}
.inventory-stat > .v-icon {
  margin-right: 8px;
}
</style>
