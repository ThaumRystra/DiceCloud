<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Creature Form Dialog
    </v-toolbar-title>
    <div>
      <creature-form
        :model="model"
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

export default {
	components: {
		DialogBase,
		CreatureForm,
	},
	props: {
		_id: String,
		startInEditTab: Boolean,
	},
	meteor: {
		model(){
			return Creatures.findOne(this._id);
		},
	},
	methods: {
		change({path, value, ack}){
			updateCreature.call({_id: this._id, path, value}, (error, result) =>{
				ack && ack(error && error.reason || error);
			});
		},
	}
};
</script>

<style lang="css" scoped>
</style>
