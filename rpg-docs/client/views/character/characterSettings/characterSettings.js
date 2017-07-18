Template.characterSettings.helpers({
	character: function() {
		return Characters.findOne(this._id, {fields: {settings: 1}});
	},
});

Template.characterSettings.events({
	"change #variantEncumbrance": function(event, instance){
		var value = instance.find("#variantEncumbrance").checked;
		if (this.settings.useVariantEncumbrance !== value){
			Characters.update(
				this._id,
				{$set: {"settings.useVariantEncumbrance": value}}
			);
		}
	},
	"change #hideSpellcasting": function(event, instance){
		var value = instance.find("#hideSpellcasting").checked;
		if (this.settings.hideSpellcasting !== value){
			Characters.update(
				this._id,
				{$set: {"settings.hideSpellcasting": value}}
			);
		}
	},
	"click #exportCharacterButton": function(event, instance) {
		Meteor.call("serialiseCharacter", this._id, function(error, result) {
			pushDialogStack({
				template: "exportDialog",
				data:     {data:result},
				element:   event.currentTarget,
			});
		});
	},
	"click #importCharacterButton": function(event, instance) {
		pushDialogStack({
			template: "importDialog",
			data:     {charId: this._id},
			element:  event.currentTarget,
		});
	},
	"click .doneButton": function(event, instance){
		popDialogStack();
	},
});
