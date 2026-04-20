<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import Creatures from '/imports/api/creature/creatures/Creatures';
import ColumnLayout from '/imports/client/ui/components/ColumnLayout.vue';
import getParentRefByTag from '../../../../../api/creature/creatureProperties/methods/getParentByTag';
import BUILT_IN_TAGS from '/imports/constants/BUILT_IN_TAGS';
import CoinValue from '/imports/client/ui/components/CoinValue.vue';
import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities';
import PrintedItem from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedLineItem.vue';
import PrintedContainer from '/imports/client/ui/creature/character/printedCharacterSheet/components/PrintedContainer.vue';
import { CreatureVariables } from '/imports/client/localCollections/CreatureVariables';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ creatureId: string }>();
const store = useStore(key);

const { result: containers } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    type: 'container',
    removed: { $ne: true },
    inactive: { $ne: true },
  }, { sort: { left: 1 } }).fetch()
);

const { result: creature } = autorun(() =>
  Creatures.findOne(props.creatureId, { fields: { color: 1, variables: 1 } })
);

const { result: variables } = autorun(() =>
  CreatureVariables.findOne({ _creatureId: props.creatureId }) || {}
);

const { result: containersWithoutAncestorContainers } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    $nor: [getFilter.descendantsOfAll(containers.value || [])],
    type: 'container',
    removed: { $ne: true },
    inactive: { $ne: true },
  }, { sort: { left: 1 } }).map((c: any) => {
    c.items = CreatureProperties.find({
      'parentId': c._id,
      type: { $in: ['item', 'container'] },
      removed: { $ne: true },
      equipped: { $ne: true },
      deactivatedByAncestor: { $ne: true },
      deactivatedByToggle: { $ne: true },
    }, { sort: { left: 1 } }).fetch();
    return c;
  })
);

const { result: carriedItems } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    $nor: [getFilter.descendantsOfAll(containers.value || [])],
    type: 'item',
    equipped: { $ne: true },
    removed: { $ne: true },
    deactivatedByAncestor: { $ne: true },
    deactivatedByToggle: { $ne: true },
  }, { sort: { left: 1 } }).fetch()
);

const { result: equippedItems } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(props.creatureId),
    type: 'item',
    equipped: true,
    removed: { $ne: true },
    inactive: { $ne: true },
  }, { sort: { left: 1 } }).fetch()
);

const { result: equipmentParentRef } = autorun(() =>
  getParentRefByTag(props.creatureId, BUILT_IN_TAGS.equipment) ||
  getParentRefByTag(props.creatureId, BUILT_IN_TAGS.inventory) ||
  { id: props.creatureId, collection: 'creatures' }
);

const { result: carriedParentRef } = autorun(() =>
  getParentRefByTag(props.creatureId, BUILT_IN_TAGS.carried) ||
  getParentRefByTag(props.creatureId, BUILT_IN_TAGS.inventory) ||
  { id: props.creatureId, collection: 'creatures' }
);

const weightCarried = computed(() =>
  stripFloatingPointOddities(
    (variables.value as any)?.weightCarried?.value || 0
  )
);

function clickProperty(_id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `tree-node-${_id}`,
    data: { _id },
  });
}
</script>

<template lang="html">
  <div class="inventory">
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
          :value="variables && variables.valueTotal && variables.valueTotal.value || 0"
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
      <printed-container :model="container" />
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
