<template lang="html">
  <dialog-base
    v-if="model"
    :color="model.color"
  >
    <template slot="toolbar">
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
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      @click="$store.dispatch('popDialogStack')"
    >
      Done
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';
import updateCreature from '/imports/api/creature/creatures/methods/updateCreature';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import CreatureForm from '/imports/client/ui/creature/CreatureForm.vue'
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import ColorPicker from '/imports/client/ui/components/ColorPicker.vue';

export default {
  components: {
    DialogBase,
    CreatureForm,
    ColorPicker,
  },
  props: {
    _id: {
      type: String,
      required: true,
    },
    startInEditTab: Boolean,
  },
  meteor: {
    model() {
      return Creatures.findOne(this._id);
    },
    editPermission() {
      try {
        assertEditPermission(this.model, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  methods: {
    change({ path, value, ack }) {
      updateCreature.call({ _id: this._id, path, value }, (error) => {
        if (error) {
          if (ack) {
            ack(error && error.reason || error)
          } else {
            console.error(error)
          }
        } else if (ack) {
          ack();
        }
      });
    },
  }
};
</script>

<style lang="css" scoped>

</style>
