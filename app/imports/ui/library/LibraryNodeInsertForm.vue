<template lang="html">
	<dialog-base :override-back-button="() => $emit('back')">
		<div slot="toolbar">Add {{propertyName}}</div>
		<component
			v-if="type"
			stored
			:is="type"
			class="library-node-form"
			:model="model"
			:errors="errors"
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
				@click="$store.dispatch('popDialogStack', model)"
			>Insert</v-btn>
		</div>
	</dialog-base>
</template>

<script>
import librarySchemas from '/imports/api/library/librarySchemas.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import propertyFormIndex from '/imports/ui/forms/components/propertyFormIndex.js';
import schemaFormMixin from '/imports/ui/forms/components/schemaFormMixin.js';
export default {
	components: {
		...propertyFormIndex,
		DialogBase,
	},
	mixins: [schemaFormMixin],
	data(){return {
		model: {
			type: this.type,
		},
		schema: undefined,
		validationContext: undefined,
	};},
	props: {
		propertyName: String,
		type: String,
	},
	watch: {
		type(newType){
			this.schema = librarySchemas[newType];
			this.validationContext = this.schema.newContext();
			let model = this.schema.clean({});
			model.type = newType;
			this.model = model;
		},
		model(newModel){
			console.log('model changed');
			console.log(newModel);
		},
	},
	methods: {
		insert(){
			console.log(this.model);
		}
	}
}
</script>

<style lang="css" scoped>
</style>
