SpellLists = new Mongo.Collection("spellLists");

Schemas.SpellLists = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	name:        {type: String, optional: true, trim: false},
	description: {type: String, optional: true, trim: false},
	saveDC:      {type: String, optional: true, trim: false},
	attackBonus: {type: String, optional: true, trim: false},
	maxPrepared: {type: String, optional: true, trim: false},
	color:   {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
	"settings.showUnprepared": {type: Boolean, defaultValue: true},
});

SpellLists.attachSchema(Schemas.SpellLists);

SpellLists.helpers({
	numPrepared: function(){
		var num = 0;
		Spells.find(
			{charId: this.charId, listId: this._id, prepared: 1},
			{fields: {prepareCost: 1}}
		).forEach(function(spell){
			num += spell.prepareCost;
		});
		return num;
	}
});

SpellLists.attachBehaviour("softRemovable");
makeParent(SpellLists); //parents of spells

SpellLists.allow(CHARACTER_SUBSCHEMA_ALLOW);
SpellLists.deny(CHARACTER_SUBSCHEMA_DENY);
