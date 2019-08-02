<template lang="html">
	<dialog-base>
		<template slot="toolbar">
			<property-icon :type="model.type" class="mr-2"/>
			<div class="title">
				{{getPropertyName(model.type)}}
			</div>
			<v-spacer/>
			<v-btn icon flat @click="remove">
				<v-icon>delete</v-icon>
			</v-btn>
		</template>
		<component
			v-if="model"
			:is="model.type"
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
				@click="$store.dispatch('popDialogStack')"
			>Done</v-btn>
		</div>
	</dialog-base>
</template>

<script>
	import LibraryNodes, { updateLibraryNode } from '/imports/api/library/LibraryNodes.js';
	import librarySchemas from '/imports/api/library/librarySchemas.js';
	import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
	import { getPropertyName } from '/imports/constants/PROPERTIES.js';
	import PropertyIcon from '/imports/ui/components/properties/PropertyIcon.vue';
	import propertyFormIndex from '/imports/ui/properties/forms/shared/propertyFormIndex.js';

	let todo = ({ack}) => {
		console.warn('not implemented');
		ack && ack();
	};
	let libraryNodePull = libraryNodePush = libraryNodeRemove = todo;

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
	      updateLibraryNode.call({_id: this._id, path, value, ack});
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
