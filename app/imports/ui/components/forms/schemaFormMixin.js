/**
 * Forms that take in a schema and a model of the current data, manages smart
 * inputs, and sends update events when valid data model changes must occur
 */
export default function schemaFormMixin(schema){
	return {
		data(){ return {
			valid: true,
		};},
		created(){
			this.validationContext = schema.newContext();
		},
		computed: {
			errors(){
				this.valid = true;
				if (!this.model){
					throw new Error("this.model must be set");
				}
				let cleanModel = this.validationContext.clean(this.model);
				this.validationContext.validate(cleanModel);
				let errors = {};
				this.validationContext.validationErrors().forEach(error => {
					if (this.valid) this.valid = false;
					errors[error.name] = Attributes.simpleSchema().messageForError(error);
				});
				return errors;
			},
		},
	};
}
