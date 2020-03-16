<template lang="html">
	<dialog-base :override-back-button="() => $emit('back')">
		<div slot="toolbar">Add {{propertyName}}</div>
		<component
			v-if="type"
			:is="type"
			class="creature-property-form"
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
import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import propertyFormIndex from '/imports/ui/properties/forms/shared/propertyFormIndex.js';
import schemaFormMixin from '/imports/ui/properties/forms/shared/schemaFormMixin.js';
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
			if (!newType) return;
			this.schema = propertySchemasIndex[newType];
			this.validationContext = this.schema.newContext();
			let model = this.schema.clean({});
			model.type = newType;
			this.model = model;
		},
	},
}
</script>

<style lang="css" scoped>
</style>
