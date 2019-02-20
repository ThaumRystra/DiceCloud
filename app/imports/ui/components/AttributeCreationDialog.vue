<template lang="html">
	<dialog-base>
		<div slot="toolbar">
			New Attribute
		</div>
		<attribute-edit
			:attribute="attribute"
			:errors="errors"
			@change="change"
			:debounce-time="0"
		/>
		<div slot="actions">
			<v-spacer/>
			<v-btn
				flat
				:disabled="!valid"
				@click="$store.dispatch('popDialogStack', attribute)"
			>
				Insert Attribute
			</v-btn>
		</div>
	</dialog-base>
</template>

<script>
	import AttributeEdit from '/imports/ui/components/AttributeEdit.vue';
	import Attributes from '/imports/api/creature/properties/Attributes.js';
	import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
	import { Tracker } from 'meteor/tracker';

	export default {
		components: {
			AttributeEdit,
			DialogBase,
		},
		data(){ return {
			attribute: {
				name: 'New Attribute',
				variableName: 'newAttribute',
				type: 'stat',
				baseValue: null,
				adjustment: null,
				decimal: null,
				reset: null,
				color: '#9E9E9E',
			},
			valid: true,
		}},
		methods: {
			change(update, ack){
				for (key in update){
					this.attribute[key] = update[key];
					if (key === 'name' && update[key]){
						const name = update[key];
						this.attribute.variableName = name.toLowerCase().replace(
							/\W+(\w?)/g, (match, p1) => p1.toUpperCase()
						);
					}
				}
				if (ack) ack();
			},
		},
		created(){
			this.validationContext = Attributes.simpleSchema().newContext();
		},
		computed: {
			errors(){
				this.valid = true;
				let cleanAtt = this.validationContext.clean(this.attribute)
				this.validationContext.validate(cleanAtt, {keys: [
					'name', 'variableName', 'type', 'baseValue', 'adjustment', 'decimal',
					'reset', 'color'
				]});
				let errors = {};
				this.validationContext.validationErrors().forEach(error => {
					if (this.valid) this.valid = false;
					errors[error.name] = Attributes.simpleSchema().messageForError(error);
				});
				return errors;
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
