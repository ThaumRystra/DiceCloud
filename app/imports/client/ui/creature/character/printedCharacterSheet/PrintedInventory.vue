<template lang="html">
  <div
    class="inventory"
  >
    <column-layout wide-columns>
      <div class="span-all">
        <div class="double-border">
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
          <div class="d-flex inventory-stat">
            <v-icon>$vuetify.icons.spell</v-icon>
            Items attuned:
            {{ variables.itemsAttuned && variables.itemsAttuned.value }}
          </div>
        </div>
      </div>
      <div class="span-all">
        <div class="octagon-border label text-center">
          Equipped
        </div>
      </div>
      <div
        v-for="item in equippedItems"
        :key="item._id"
      >
        <printed-item
          class="double-border"
          :model="item"
        />
      </div>
      <div class="span-all">
        <div class="octagon-border label text-center">
          Carried
        </div>
      </div>
      <div
        v-for="item in carriedItems"
        :key="item._id"
      >
        <printed-item
          class="double-border"
          :model="item"
        />
      </div>
      <template
        v-for="container in containersWithoutAncestorContainers"
      >
        <div 
          :key="container._id"
          class="span-all"
        >
          <printed-container
            class="octagon-border"
            :model="container"
          />
        </div>
        <div
          v-for="item in container.items"
          :key="item._id"
        >
          <printed-item
            class="double-border"
            :model="item"
          />
        </div>
      </template>
    </column-layout>
  </div>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import getParentRefByTag from '/imports/api/creature/creatureProperties/methods/getParentRefByTag.js';
import BUILT_IN_TAGS from '/imports/constants/BUILT_IN_TAGS.js';
import CoinValue from '/imports/client/ui/components/CoinValue.vue';
import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities.js';
import PrintedItem from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedItem.vue';
import PrintedContainer from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedContainer.vue';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables.js';

export default {
  components: {
    ColumnLayout,
    CoinValue,
    PrintedItem,
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
        'ancestors.id': this.creatureId,
        type: 'container',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { order: 1 },
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
        'ancestors.id': {
          $eq: this.creatureId,
          $nin: this.containerIds
        },
        type: 'container',
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { order: 1 },
      }).map(c => {
        c.items = CreatureProperties.find({
          'parent.id': c._id,
          type: { $in: ['item', 'container'] },
          removed: { $ne: true },
          equipped: { $ne: true },
          deactivatedByAncestor: { $ne: true },
          deactivatedByToggle: { $ne: true },
        }, {
          sort: { order: 1 },
        }).fetch();
        return c;
      });
    },
    carriedItems() {
      return CreatureProperties.find({
        'ancestors.id': {
          $eq: this.creatureId,
          $nin: this.containerIds
        },
        type: 'item',
        equipped: { $ne: true },
        removed: { $ne: true },
        deactivatedByAncestor: { $ne: true },
        deactivatedByToggle: { $ne: true },
      }, {
        sort: { order: 1 },
      });
    },
    equippedItems() {
      return CreatureProperties.find({
        'ancestors.id': {
          $eq: this.creatureId,
        },
        type: 'item',
        equipped: true,
        removed: { $ne: true },
        inactive: { $ne: true },
      }, {
        sort: { order: 1 },
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
    containerIds() {
      return this.containers.map(container => container._id);
    },
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
  font-size: 14pt;
  font-variant: small-caps;
  flex-grow: 1;
}

.inventory-stat {
  font-size: 12pt;
  line-height: 32px;
}
.inventory-stat > .v-icon {
  margin-right: 8px;
}
</style>
