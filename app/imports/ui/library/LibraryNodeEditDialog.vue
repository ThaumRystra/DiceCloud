<template lang="html">
	<dialog-base v-show="step == 1" class="step-1" key="left">
		<template slot="toolbar">
			<div>Add {{propertyName}}</div>
			<v-btn icon flat @click="remove">
				<v-icon>delete</v-icon>
			</v-btn>
		</template>
		<component
			v-if="type"
			:is="type"
			class="library-node-form"
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
				:disabled="!valid"
				@click="$store.dispatch('popDialogStack')"
			>Done</v-btn>
		</div>
	</dialog-base>
</template>

<script>
import librarySchemas from '/imports/api/library/librarySchemas.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import propertyFormIndex from '/imports/ui/forms/components/propertyFormIndex.js';

let todo = () => console.log('not implemented');
let libraryNodeSet = libraryNodePull = libraryNodePush = libraryNodeRemove = todo;

export default {
  components: {
		...propertyFormIndex,
    DialogBase,
  },
	props: {
		_id: String,
	},
	meteor: {
		model(){
			return LibrarNodes.findOne(this._id);
		},
	},
	methods: {
		change({path, value, ack}){
      libraryNodeSet({_id: this._id, path, value}, e => ack(e));
		},
    push({path, value, ack}){
			libraryNodePush({_id: this._id, path}, e => ack(e));
    },
    pull({path, ack}){
			libraryNodePull({_id: this._id, path}, e => ack(e));
    },
		remove(){
			libraryNodeRemove({_id: this._id});
		},
	}
};
</script>

<style lang="css" scoped>
</style>
