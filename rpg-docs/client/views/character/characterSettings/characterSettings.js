Template.characterSettings.helpers({
	character: function() {
		return Characters.findOne(this._id, {fields: {settings: 1}});
	}
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
	"click .doneButton": function(event, instance){
		popDialogStack();
	},
});
