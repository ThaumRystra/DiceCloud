//Features are features that can be selected but not edited
//they are the things that come in the player's handbook and
//facilitate the quick building of characters
//They are the primary means of collecting cease and desist letters :(
//
//Should only be edited by admins
//
//TODO add a Meteor Method that lets users add a feature to their character
//and pushes the effects and actions accordingly
//
//TODO add a Method that updates every character with a given feature if that feature should change

Features = new Meteor.Collection("features");

Schemas.Feature = new SimpleSchema({
	_id: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function(){
			if(!this.isSet) return Random.id();
		}
	},
	name:       {type: String},
	description:{type: String, optional: true},
	source:     {type: String, optional: true},
	effects:    {type: [Schemas.Effect], defaultValue: []},
	actions:    {type: [Schemas.Action], defaultValue: []},
	attacks:	{type: [Schemas.Attack], defaultValue: []},
	spells:		{type: [Schemas.Spell] , defaultValue: []},
});

Features.attachSchema(Schemas.Feature);

//observe standard features for changes and update characters using them
Features.find().observe({
	changed: function(newFeature, oldFeature){
		//TODO
	},
	removed: function(oldFeature){
		//TODO
	}
});