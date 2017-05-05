Template.newCharacterDialog.onCreated(function(){
	this.character = {};
	this.schema = new SimpleSchema({
		//strings
		name:      {type: String},
		gender:    {type: String, optional: true},
		race:      {type: String, optional: true},
	});
	this.context = this.schema.newContext();
	this.context.runOnce = new ReactiveVar(false);
});

Template.newCharacterDialog.helpers({
	invalid(){
		let context = Template.instance().context;
		let valid = context.isValid() && context.runOnce.get();
		return !valid;
	},
	errorAtts(key){
		let error = Template.instance().context.keyErrorMessage(key);
		if (error){
			return {
				invalid: true,
				["error-message"]: error,
			}
		}
	},
});

changeFunction = function(field){
	return _.debounce(function(event, instance){
		instance.character[field] = event.currentTarget.value;
		instance.schema.clean(instance.character);
		instance.context.validate(instance.character);
		if (!instance.context.runOnce.get()) instance.context.runOnce.set(true);
	}, 200);
};

Template.newCharacterDialog.events({
	"input .nameInput": changeFunction("name"),
	"input .genderInput": changeFunction("gender"),
	"input .raceInput": changeFunction("race"),
	"click .cancelButton": function(event, instance){
		popDialogStack();
	},
	"click .addButton": function(event, instance){
		popDialogStack(instance.character);
	},
});
