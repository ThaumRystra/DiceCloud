<template>
  <v-fade-transition
    group
    leave-absolute
    hide-on-leave
    class="column-layout wide-columns"
  >
    <div
      v-for="pointBuy in pointBuys"
      :key="pointBuy._id"
      style="transition: all 0.3s !important"
    >
      <point-buy-card
        :model="pointBuy"
        hover
        @ignore="ignoreProp(pointBuy._id)"
        @click="editPointBuy(pointBuy._id)"
      />
    </div>
    <div
      v-for="slot in slots"
      :key="slot._id"
      style="transition: all 0.3s !important"
    >
      <slot-card
        :model="slot"
        hover
        @ignore="ignoreProp(slot._id)"
        @click="fillSlot(slot._id)"
      />
    </div>
  </v-fade-transition>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import SlotCard from '/imports/client/ui/creature/slots/SlotCard.vue';
import PointBuyCard from '/imports/client/ui/properties/components/pointBuy/PointBuyCard.vue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import { key } from '/imports/client/ui/vuexStore';

const context = inject('context', {} as any);
const store = useStore(key);

const { result: slots } = autorun(() => {
  const folderIds = CreatureProperties.find({
    ...getFilter.descendantsOfRoot(context.creatureId),
    type: 'folder',
    hideStatsGroup: true,
    removed: { $ne: true },
    inactive: { $ne: true },
  }, { fields: { _id: 1 } }).map((folder: any) => folder._id);

  return CreatureProperties.find({
    ...getFilter.descendantsOfRoot(context.creatureId),
    parentId: { $nin: folderIds },
    type: 'propertySlot',
    ignored: { $ne: true },
    $and: [
      { $or: [{ 'slotCondition.value': { $nin: [false, 0, ''] } }, { 'slotCondition.value': { $exists: false } }] },
      { $or: [{ 'quantityExpected.value': { $in: [false, 0, '', undefined] } }, { 'quantityExpected.value': { exists: false } }, { spaceLeft: { $gt: 0 } }] },
    ],
    removed: { $ne: true },
    inactive: { $ne: true },
  }).fetch();
});

const { result: pointBuys } = autorun(() =>
  CreatureProperties.find({
    ...getFilter.descendantsOfRoot(context.creatureId),
    type: 'pointBuy',
    ignored: { $ne: true },
    removed: { $ne: true },
    inactive: { $ne: true },
  }).fetch()
);

async function ignoreProp(_id: string) {
  try {
    await updateCreatureProperty.callAsync({ _id, path: ['ignored'], value: true });
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.reason || error.message || error.toString() });
  }
}

function editPointBuy(_id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `point-buy-card-${_id}`,
    data: { _id, startInEditTab: true },
  });
}
</script>

<style></style>
