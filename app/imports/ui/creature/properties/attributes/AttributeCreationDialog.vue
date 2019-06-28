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
		<v-spacer slot="actions"/>
		<v-btn
			flat
			slot="actions"
			:disabled="!valid"
			@click="$store.dispatch('popDialogStack', attribute)"
		>
			Insert Attribute
		</v-btn>
	</dialog-base>
</template>

<script>
	import AttributeForm from '/imports/ui/creature/properties/attributes/AttributeForm.vue';
	import Attributes from '/imports/api/creature/properties/Attributes.js';
	import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';

	export default {
		components: {
			AttributeForm,
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
		created(){
			this.validationContext = Attributes.simpleSchema().newContext();
		},
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
