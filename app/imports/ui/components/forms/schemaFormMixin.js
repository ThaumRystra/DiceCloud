/**
 * Forms that take in a schema and a model of the current data, manages smart
 * inputs, and sends update events when valid data model changes must occur
 */
const schemaFormMixin = {
	data(){ return {
		valid: true,
	};},
	computed: {
		errors(){
			this.valid = true;
			if (!this.model){
				throw new Error("this.model must be set");
			}
			if (!this.validationContext) return {};
			let cleanModel = this.validationContext.clean(this.model, {
				getAutoValues: false,
			});
			this.validationContext.validate(cleanModel);
			let errors = {};
			this.validationContext.validationErrors().forEach(error => {
				if (this.valid) this.valid = false;
				errors[error.name] = this.schema.messageForError(error);
			});
			return errors;
		},
	},
	methods: {
		change(modifier, ack){
			for (let key in modifier){
				this.$set(this.model, key, modifier[key])
			}
			if (ack) ack();
		},
	},
};

export default schemaFormMixin;
