import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import Attributes from "/imports/api/creature/properties/Attributes.js";
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import {makeParent} from "/imports/api/parenting.js";

let SpellLists = new Mongo.Collection("spellLists");

let spellListSchema = schema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	name:        {type: String, optional: true, trim: false},
	description: {type: String, optional: true, trim: false},
	saveDC:      {type: String, optional: true, trim: false},
	attackBonus: {type: String, optional: true, trim: false},
	maxPrepared: {type: String, optional: true, trim: false},
});

SpellLists.attachSchema(spellListSchema);
Attributes.attachSchema(ColorSchema);

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

//SpellLists.attachBehaviour("softRemovable");
makeParent(SpellLists); //parents of spells

export default SpellLists;
