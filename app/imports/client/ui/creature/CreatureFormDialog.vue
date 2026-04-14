<script setup lang="ts">
import { autorun } from 'vue-meteor-tracker';
import Creatures from '/imports/api/creature/creatures/Creatures';
import updateCreature from '/imports/api/creature/creatures/methods/updateCreature';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import CreatureForm from '/imports/client/ui/creature/CreatureForm.vue';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import ColorPicker from '/imports/client/ui/components/ColorPicker.vue';

const props = withDefaults(defineProps<{
  _id: string;
  startInEditTab?: boolean;
}>(), {
  startInEditTab: false,
});

const { result: model } = autorun(() => Creatures.findOne(props._id));

const { result: editPermission } = autorun(() => {
  if (!model.value) return false;
  try {
    assertEditPermission(model.value, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

async function change({ path, value, ack }: { path: string[]; value: any; ack?: Function }) {
  try {
    await updateCreature.callAsync({ _id: props._id, path, value });
    if (ack) ack();
  } catch (error: any) {
    if (ack) {
      ack(error.reason || error);
    } else {
      console.error(error);
    }
  }
}
</script>

<template lang="html">
  <dialog-base
    v-if="model"
    :color="model.color"
  >
    <template #toolbar>
      <v-toolbar-title>
        Character Details
      </v-toolbar-title>
      <v-spacer />
      <color-picker
        :value="model.color"
        no-color-change
        @input="value => change({path: ['color'], value})"
      />
    </template>
    <div>
      <creature-form
        :model="model"
        :disabled="editPermission === false"
        @change="change"
      />
    </div>
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        @click="$store.dispatch('popDialogStack')"
      >
        Done
      </v-btn>
    </template>
  </dialog-base>
</template>

<style lang="css" scoped>

</style>
