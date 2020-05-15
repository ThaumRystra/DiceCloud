<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model && model.name }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        flat
        icon
        data-id="share-library-button"
        @click="share"
      >
        <v-icon>share</v-icon>
      </v-btn>
      <v-btn
        flat
        icon
        data-id="delete-library-button"
        @click="remove"
      >
        <v-icon>delete</v-icon>
      </v-btn>
    </template>
    <template v-if="model">
      <text-field
        label="name"
        :value="model.name"
        @change="updateName"
      />
    </template>
    <template slot="actions">
      <v-spacer />
      <v-btn
        flat
        data-id="delete-library-button"
        @click="$store.dispatch('popDialogStack')"
      >
        Done
      </v-btn>
    </template>
  </dialog-base>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import Libraries, { updateLibraryName, removeLibrary } from '/imports/api/library/Libraries.js';

export default {
	components: {
		DialogBase,
	},
	props: {
		_id: String,
	},
	methods: {
		updateName(value, ack){
			updateLibraryName.call({_id: this._id, name: value}, (error) =>{
				ack(error && error.reason || error);
			});
		},
		remove(){
			let that = this;
			this.$store.commit('pushDialogStack', {
				component: 'delete-confirmation-dialog',
				elementId: 'delete-library-button',
				data: {
					name: this.model.name,
					typeName: 'Library'
				},
				callback(confirmation){
					if(!confirmation) return;
					removeLibrary.call({_id: that._id}, (error) => {
						if (error) {
							console.error(error);
						} else {
							that.$store.dispatch('popDialogStack')
						}
					});
				}
			});
		},
    share(){
			this.$store.commit('pushDialogStack', {
				component: 'share-dialog',
				elementId: 'share-library-button',
				data: {
					docRef: {
            id: this._id,
            collection: 'libraries',
          }
				},
			});
		},
	},
	meteor: {
		model(){
			return Libraries.findOne(this._id);
		},
	}
}
</script>

<style lang="css" scoped>
</style>
