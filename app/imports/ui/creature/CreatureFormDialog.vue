<template lang="html">
  <dialog-base :color="model.color">
    <template slot="toolbar">
      <v-toolbar-title>
        Creature Form Dialog
      </v-toolbar-title>
      <v-spacer />
      <color-picker
        :value="model.color"
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
      flat
      @click="$store.dispatch('popDialogStack')"
    >
      Done
    </v-btn>
  </dialog-base>
</template>

<script>
import Creatures from '/imports/api/creature/Creatures.js';
import {updateCreature} from '/imports/api/creature/Creatures.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import CreatureForm from '/imports/ui/creature/CreatureForm.vue'
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import ColorPicker from '/imports/ui/components/ColorPicker.vue';

export default {
	components: {
		DialogBase,
		CreatureForm,
    ColorPicker,
	},
	props: {
		_id: String,
		startInEditTab: Boolean,
	},
	meteor: {
		model(){
			return Creatures.findOne(this._id);
		},
    editPermission(){
      try {
        assertEditPermission(this.model, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
	},
	methods: {
		change({path, value, ack}){
			updateCreature.call({_id: this._id, path, value}, (error) =>{
        if (error){
          if(ack){
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
