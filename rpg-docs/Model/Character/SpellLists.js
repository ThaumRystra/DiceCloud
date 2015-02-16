SpellLists = new Meteor.Collection("spellLists");

Schemas.SpellLists = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	name:        {type: String},
	description: {type: String, optional: true},
	saveDC:      {type: String, optional: true},
	attackBonus: {type: String, optional: true},
	maxPrepared: {type: String, optional: true},
	color:   {type: String, allowedValues: _.pluck(colorOptions, "key"), defaultValue: "q"},
	"settings.showUnprepared": {type: Boolean, defaultValue: true},
});

SpellLists.attachSchema(Schemas.SpellLists);

SpellLists.helpers({
	numPrepared: function(){
		var num = 0;
		Spells.find({charId: this.charId, listId: this._id, prepared: 1}, {fields: {prepareCost: 1}}).forEach(function(spell){
			num += spell.prepareCost;
		});
		return num;
	}
});
