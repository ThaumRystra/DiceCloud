<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <property-icon
        :type="model.type"
        class="mr-2"
      />
      <v-toolbar-title class="title">
        {{ getPropertyName(model.type) }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        flat
        @click="remove"
      >
        <v-icon>delete</v-icon>
      </v-btn>
    </template>
    <component
      :is="model.type"
      v-if="model"
      class="library-node-form"
      stored
      :model="model"
      @change="change"
      @push="push"
      @pull="pull"
    />
    <div
      slot="actions"
      class="layout row justify-end"
    >
      <v-btn
        flat
        @click="$store.dispatch('popDialogStack')"
      >
        Done
      </v-btn>
    </div>
  </dialog-base>
</template>

<script>
	import LibraryNodes, {
		updateLibraryNode,
		pushToLibraryNode,
		pullFromLibraryNode,
		softRemoveLibraryNode,
	} from '/imports/api/library/LibraryNodes.js';
	import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
	import { getPropertyName } from '/imports/constants/PROPERTIES.js';
	import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
	import propertyFormIndex from '/imports/ui/properties/forms/shared/propertyFormIndex.js';
	import { get } from 'lodash';

	export default {
	  components: {
			...propertyFormIndex,
			PropertyIcon,
	    DialogBase,
	  },
		props: {
			_id: String,
		},
		meteor: {
			model(){
				return LibraryNodes.findOne(this._id);
			},
		},
		methods: {
			getPropertyName,
			change({path, value, ack}){
	      updateLibraryNode.call({_id: this._id, path, value}, (error, result) =>{
					ack && ack(error && error.reason || error);
				});
			},
	    push({path, value, ack}){
				pushToLibraryNode.call({_id: this._id, path, value}, (error, result) =>{
					ack && ack(error && error.reason || error);
				});
	    },
	    pull({path, ack}){
				let itemId = get(this.model, path)._id;
				path.pop();
				pullFromLibraryNode.call({_id: this._id, path, itemId}, (error, result) =>{
					ack && ack(error && error.reason || error);
				});
	    },
			remove(){
				softRemoveLibraryNode.call({_id: this._id});
				this.$store.dispatch('popDialogStack');
			},
		}
	};
</script>

<style lang="css" scoped>
</style>
