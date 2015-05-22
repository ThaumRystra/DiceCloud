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
});
