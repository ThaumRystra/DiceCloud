Template.importDialog.onCreated(function() {
	this.nameOk = new ReactiveVar(false);
	this.dataOk = new ReactiveVar(false);
	this.canImport = new ReactiveVar(false);
	this.autorun(() => {
		this.canImport.set (this.nameOk.get() && this.dataOk.get());
	});
});

Template.importDialog.helpers({
	cantDelete: function() {
		return !Template.instance().canImport.get();
	},
	getStyle: function() {
		if (Template.instance().canImport.get()) {
			return "background: #d23f31; color: white;";
		}
	},
	name: function() {
		return Characters.findOne({_id: this.charId}).name;
	}
});

const debounce = (f) => _.debounce(f, 300);

Template.importDialog.events({
	"change #nameInput, input #nameInput": function(event, instance) {
		var ok = instance.find("#nameInput").value === Characters.findOne({_id: this.charId}).name;
		instance.nameOk.set(ok);
		if (!ok) {
			instance.canImport.set(false);
		}
	},
	"click #importButton": function(event, instance) {
		if (instance.find("#nameInput").value === Characters.findOne({_id: this.charId}).name) {
			json = Base64.decode(instance.find("#dataInput").value);

			var jsonError = "";
			try {JSON.parse(json)}
			catch(err) {jsonError = err.message;}

			var validationError = "";
			try {Schemas.SerialisedCharacter.validate(JSON.parse(json))}
			catch (err) {validationError = err.message}

			if (!jsonError && !validationError) { //check it again
				Meteor.call("importCharacter", this.charId, json);
				popDialogStack();
			}
		}
	},
	"click .cancelButton": function(event, instance){
		popDialogStack();
	},
	"input #dataInput": debounce(function(event, instance){
		const input = event.currentTarget;
		var json = Base64.decode(input.value);

		if (!json){ //if it's empty
			input.invalid = true;
			instance.dataOk.set(false);
			instance.canImport.set(false);
			input.errorMessage = ""; //the label already says "Paste export string here"
			return;
		} 

		var jsonError = "";
		try {JSON.parse(json)}
		catch(err) {jsonError = err.message}

		if (jsonError) {
			input.invalid = true;
			instance.dataOk.set(false);
			instance.canImport.set(false);
			input.errorMessage = "Export JSON invalid: " + jsonError;
			return;
		}

		var validationError = "";
		try {Schemas.SerialisedCharacter.validate(JSON.parse(json))}
		catch (err) {validationError = err.message}

		if (validationError) {
			input.invalid = true;
			instance.dataOk.set(false);
			instance.canImport.set(false);
			input.errorMessage = "Invalid export string: " + validationError;
			return;
		}
	
		input.invalid = false;
		instance.dataOk.set(true);
		
	}),
});